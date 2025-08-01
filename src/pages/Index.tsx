import { useState, useEffect, useMemo } from 'react';
import { Phone, ShoppingCart, Heart, Filter, Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useProducts, Product, FilterOptions } from '@/hooks/useProducts';

interface CartItem {
  id: string;
  quantity: number;
  product: Product & { displayPrice: number };
  quantityType: 'single' | 'dozen';
}

const Index = () => {
  const { products, categories, loading, error, filterProducts } = useProducts();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [showCheckoutContact, setShowCheckoutContact] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'All',
    search: '', // This will remain but effectively not used in the UI for search input
    minPrice: 0, // These will remain but effectively not used in the UI for price filter
    maxPrice: 2000, // These will remain but effectively not used in the UI for price filter
  });

  // Filtered products based on category selection
  const filteredProducts = useMemo(() => {
    // We only filter by category now, search and price filters are removed from UI
    return filterProducts({
      category: filters.category,
      search: '', // Always pass empty string for search
      minPrice: 0, // Always pass 0 for minPrice
      maxPrice: 2000, // Always pass 2000 for maxPrice
    });
  }, [products, filters.category, filterProducts]);

  const addToCart = (product: Product, quantityType: 'single' | 'dozen') => {
    const displayPrice = quantityType === 'dozen' ? product.price * 12 : product.price;
    
    const existingItem = cart.find(item => item.id === product.id && item.quantityType === quantityType);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id && item.quantityType === quantityType
          ? {...item, quantity: item.quantity + 1}
          : item
      ));
    } else {
      const cartItem: CartItem = {
        id: product.id,
        quantity: 1,
        product: {...product, displayPrice},
        quantityType
      };
      setCart([...cart, cartItem]);
    }
    
    const displayName = quantityType === 'dozen' ? `${product.name} (1 Dozen)` : product.name;
    toast.success(`${displayName} added to cart!`);
  };

  const updateCartQuantity = (id: string, quantityType: 'single' | 'dozen', change: number) => {
    setCart(cart.map(item => {
      if (item.id === id && item.quantityType === quantityType) {
        const newQuantity = Math.max(0, item.quantity + change);
        return newQuantity === 0 ? null : {...item, quantity: newQuantity};
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const getTotalPrice = () => {
    const subtotal = cart.reduce((total, item) => total + (item.product.displayPrice * item.quantity), 0);
    const discount = subtotal >= 500 ? subtotal * 0.05 : 0;
    return { subtotal, discount, total: subtotal - discount };
  };

  const handleContact = () => {
    setShowContactPopup(true);
  };

  const handleCheckoutContact = () => {
    setShowCart(false);
    setShowCheckoutContact(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">HRC - Harsh Rakhi Center</h2>
          <p className="text-muted-foreground">Loading Beautiful Rakhis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading products: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Contact Popup */}
      {showContactPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border animate-scale-in">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Contact Us</h3>
            <p className="text-muted-foreground mb-6">Call us to place your order</p>
            
            <a 
              href="tel:+919887198488"
              className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-4"
            >
              <Phone className="w-5 h-5 mr-3" />
              +91-9887198488
            </a>
            
            <Button 
              variant="ghost" 
              onClick={() => setShowContactPopup(false)}
              className="w-full rounded-2xl"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Checkout Contact Popup */}
      {showCheckoutContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border animate-scale-in">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-4">Checkout</h3>
            <p className="text-muted-foreground mb-2">Total: ₹{getTotalPrice().total.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mb-6">Call us to complete your order</p>
            
            <a 
              href="tel:+919887198488"
              className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 mb-4"
            >
              <Phone className="w-5 h-5 mr-3" />
              Call to Order - +91-9887198488
            </a>
            
            <Button 
              variant="ghost" 
              onClick={() => setShowCheckoutContact(false)}
              className="w-full rounded-2xl"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-card/90 backdrop-blur-xl shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">HRC</h1>
                <p className="text-sm text-muted-foreground -mt-1 font-medium">Harsh Rakhi Center</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCart(!showCart)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
              <Button onClick={handleContact} className="shadow-lg">
                <Phone className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Contact</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Popup */}
      {showCart && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden border animate-scale-in">
            <div className="p-6 border-b bg-muted/30">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-card-foreground">Shopping Cart</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCart(false)}
                  className="hover:bg-background/80 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-64">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">Add some beautiful rakhis!</p>
                </div>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={`${item.id}-${item.quantityType}`} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-semibold text-card-foreground text-sm">
                          {item.product.name} {item.quantityType === 'dozen' ? '(Dozen)' : '(Single)'}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-6 h-6 p-0 rounded-full"
                            onClick={() => updateCartQuantity(item.id, item.quantityType, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-6 h-6 p-0 rounded-full"
                            onClick={() => updateCartQuantity(item.id, item.quantityType, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-bold text-card-foreground ml-4">₹{(item.product.displayPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="mt-6 space-y-3 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold">₹{getTotalPrice().subtotal.toFixed(2)}</span>
                    </div>
                    {getTotalPrice().discount > 0 && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Discount (5%):</span>
                        <span className="font-semibold">-₹{getTotalPrice().discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-3">
                      <span>Total:</span>
                      <span className="text-card-foreground">₹{getTotalPrice().total.toFixed(2)}</span>
                    </div>
                    <Button 
                      onClick={handleCheckoutContact} 
                      className="w-full mt-4 shadow-lg rounded-xl h-12"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Checkout - Call to Order
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Beautiful Hero Section */}
        <div className="text-center mb-16">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-muted/20 to-background rounded-3xl blur-3xl opacity-60"></div>
            
            <div className="relative bg-card/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl border animate-fade-in">
              <div className="inline-flex items-center px-6 py-3 bg-muted rounded-full mb-8">
                <span className="text-sm font-semibold text-muted-foreground">✨ Premium Rakhi Collection 2025</span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-bold mb-8 leading-tight font-playfair">
                <span className="text-foreground">Beautiful</span>
                <br />
                <span className="text-muted-foreground">Rakhis</span>
              </h2>
              
             <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 md:mb-10 max-w-md sm:max-w-lg md:max-w-2xl mx-auto leading-relaxed px-4 sm:px-0 text-center">
  Celebrate the sacred bond with our handcrafted premium rakhi collection. 
  Each piece tells a story of love and tradition.
</p>

              
              {/* Modern Category Filter */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                   <div className="flex items-center space-x-3">
                     <Filter className="w-5 h-5 text-muted-foreground" />
                     <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                       <SelectTrigger className="w-48 rounded-2xl bg-background/80 backdrop-blur-sm shadow-lg">
                         <SelectValue placeholder="All Categories" />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl">
                         {categories.map((category) => (
                           <SelectItem key={category.id} value={category.name} className="rounded-lg">
                             {category.name}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Products Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredProducts.map((product) => (
             <Card key={product.id} className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-card shadow-lg rounded-3xl overflow-hidden border animate-fade-in">
               <CardContent className="p-0">
                 <div className="relative overflow-hidden">
                   <img
                     src={product.image_url || '/placeholder.svg'}
                     alt={product.name}
                     className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                   
                   {product.discount > 0 && (
                     <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground border-0 rounded-full px-3 py-1">
                       {product.discount}% OFF
                     </Badge>
                   )}
                 </div>
                 
                 <div className="p-6">
                   <h3 className="text-lg font-bold text-card-foreground mb-2 group-hover:text-muted-foreground transition-colors line-clamp-1">
                     {product.name}
                   </h3>
                   
                   <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                     {product.description}
                   </p>
                   
                   <div className="flex items-center justify-between mb-6">
                     <div className="flex items-baseline space-x-2">
                       <span className="text-2xl font-bold text-card-foreground">₹{product.price}</span>
                       {product.original_price && product.original_price > product.price && (
                         <span className="text-lg text-muted-foreground line-through">₹{product.original_price}</span>
                       )}
                     </div>
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300 rounded-full">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Single Rakhi Option */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">Single Rakhi</p>
                        <p className="text-sm text-gray-600">₹{product.price}</p>
                      </div>
                      <Button
                        onClick={() => addToCart(product, 'single')}
                        size="sm"
                        className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl shadow-lg transition-all duration-300"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    {/* Dozen Rakhi Option */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">1 Dozen (12 Rakhis)</p>
                        <p className="text-sm text-gray-600">₹{product.price * 12}</p>
                      </div>
                      <Button
                        onClick={() => addToCart(product, 'dozen')}
                        size="sm"
                        className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-xl shadow-lg transition-all duration-300"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    
                    {/* Contact Button */}
                    <Button
                      variant="outline"
                      onClick={handleContact}
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Contact to Buy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clean Footer */}
        <footer className="mt-20">
          <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl text-center">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-3xl font-bold mb-4 text-white">
                HRC - Harsh Rakhi Center
              </h3>
              <p className="text-gray-300 mb-6 text-lg">
                Spreading love and joy through beautiful handcrafted rakhis
              </p>
              
              <Button 
                onClick={handleContact} 
                size="lg" 
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl h-14 px-8 text-lg"
              >
                <Phone className="w-6 h-6 mr-3" />
                Contact Us Now
              </Button>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  Made with ❤️ for celebrating the sacred bond of Raksha Bandhan.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
