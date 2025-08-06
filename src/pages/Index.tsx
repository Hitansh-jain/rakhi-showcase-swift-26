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
const generateWhatsAppURL = () => {
  const phoneNumber = '919887198488';

  const cartDetails = cart.map((item, index) => {
    const name = item.quantityType === 'dozen'
      ? `${item.product.name} (Dozen)`
      : item.product.name;

    // Hide preview for image link
    const imageUrl = item.product.image_url
      ? item.product.image_url.replace('https://', 'https://\u200B')  // adds zero-width space
      : '';

    return `🧿 *${name}*
Qty: ${item.quantity}
Price: ₹${(item.product.displayPrice * item.quantity).toFixed(0)}
${imageUrl ? `🖼️ Image: ${imageUrl}` : ''}`;
  }).join('\n\n');

  const { subtotal, discount, total } = getTotalPrice();

  const message = `🎁 *HRC Rakhi Order*

🧵 *Items Ordered:*
${cartDetails}

💰 *Order Summary:*
Subtotal: ₹${subtotal.toFixed(0)}${discount > 0 ? `\nDiscount: -₹${discount.toFixed(0)}` : ''}
*Total: ₹${total.toFixed(0)}*

🙏 Kindly confirm my order. Thank you!
– *Customer via HRC Website*`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};

  const handleCheckoutContact = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    
    setShowCart(false);
    
    // Generate WhatsApp URL and open it
    const whatsappURL = generateWhatsAppURL();
    window.open(whatsappURL, '_blank');
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
          <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] sm:max-h-[80vh] border animate-scale-in flex flex-col">
            <div className="p-6 border-b bg-muted/30 flex-shrink-0">
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
            
            {cart.length === 0 ? (
              <div className="text-center py-8 flex-1 flex items-center justify-center">
                <div>
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">Add some beautiful rakhis!</p>
                </div>
              </div>
            ) : (
              <>
                {/* Scrollable Products Section */}
                <div className="p-6 overflow-y-auto flex-1 min-h-0">
                  {cart.map(item => (
                    <div key={`${item.id}-${item.quantityType}`} className="flex items-center py-3 border-b last:border-0 gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={item.product.image_url || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-card-foreground text-sm truncate">
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
                      <p className="font-bold text-card-foreground text-sm">₹{(item.product.displayPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                {/* Fixed Bottom Section */}
                <div className="p-6 border-t bg-muted/30 flex-shrink-0">
                  <div className="space-y-3">
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
                      className="w-full mt-4 shadow-lg rounded-xl h-12 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                      </svg>
                      WhatsApp Order
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Checkout Button */}
      {cart.length > 0 && (
        <Button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-2xl rounded-full w-16 h-16 flex items-center justify-center animate-pulse-glow"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </div>
        </Button>
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
