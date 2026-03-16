import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Card, Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMenuItems, addToCart, getCart } from '../services/api';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user, addToast } = useAuth();
  const navigate = useNavigate();
  const [bestsellers, setBestsellers] = useState([]);
  const [loadingBestsellers, setLoadingBestsellers] = useState(true);
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });

  const fetchData = useCallback(async () => {
    setLoadingBestsellers(true);
    try {
      const [menuRes, cartRes] = await Promise.all([
        getMenuItems(),
        user ? getCart() : Promise.resolve({ data: { items: [] } })
      ]);
      
      console.log('Menu API response:', menuRes.data?.length, 'items');
      const bestArr = menuRes.data.filter(item => 
        item.categoryId?.categoryName === 'Bestsellers'
      ).slice(0, 5); 
      console.log('Bestsellers found:', bestArr.length);
      setBestsellers(bestArr);
      
      if (user) setCart(cartRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingBestsellers(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getItemInCart = (itemId) => {
    return cart.items.find(i => {
      const id = i.itemId?._id || i.itemId;
      return id === itemId;
    });
  };

  const handleAddToCart = async (item) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart({
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1
      });
      setCart(prev => ({
        ...prev,
        items: [...prev.items, { itemId: item._id, quantity: 1, price: item.price }]
      }));
      addToast('SUCCESS', `${item.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const carouselItems = [
    {
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
      title: "Authentic Wood-Fired Pizzas",
      subtitle: "Taste the tradition in every bite",
    },
    {
      image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=2070&auto=format&fit=crop",
      title: "Fresh Ingredients Daily",
      subtitle: "Locally sourced for maximum flavor",
    },
    {
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=2070&auto=format&fit=crop",
      title: "Fast Delivery",
      subtitle: "Hot and fresh to your doorstep",
    }
  ];

  const categoryImages = {
    'Pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=500&auto=format&fit=crop',
    'Sides': 'https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'Beverages': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500&auto=format&fit=crop',
    'Combo': 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=500&auto=format&fit=crop',
    'Bestsellers': 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?q=80&w=500&auto=format&fit=crop',
    'Veg': 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=500&auto=format&fit=crop',
    'Non-Veg': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500&auto=format&fit=crop',
    'New Launches': 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=500&auto=format&fit=crop'
  };

  return (
    <div className="home-container d-flex flex-column min-vh-100">
      <Navbar transparent={true} />

      {/* Full Screen Carousel */}
      <div className="hero-section">
        <Carousel fade interval={4000} className="vh-100 w-100">
          {carouselItems.map((item, index) => (
            <Carousel.Item key={index} className="vh-100">
              <div 
                className="d-block w-100 h-100"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${item.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Carousel.Caption className="d-flex flex-column align-items-center justify-content-center h-100 pb-0">
                <h1 className="display-1 fw-bold text-white mb-3 text-shadow-lg">{item.title}</h1>
                <p className="fs-3 text-light mb-5">{item.subtitle}</p>
                <Button variant="danger" size="lg" className="rounded-pill px-5 py-3 fs-5 fw-bold shadow hover-scale" onClick={() => {
                  if (user) {
                    navigate('/cart');
                  } else {
                    navigate('/login');
                  }
                }}>
                  Order Now
                </Button>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>

      {/* Guest Login/Register Call to Action */}
      {!user && (
        <div className="bg-danger py-4 shadow-sm text-center">
          <Container>
            <h4 className="text-white fw-bold mb-3">Craving a delicious pizza? Login or Register to start ordering!</h4>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={() => navigate('/login')}>
                Login to Order
              </Button>
              <Button variant="outline-light" className="rounded-pill px-4 fw-bold" onClick={() => navigate('/register')}>
                Create an Account
              </Button>
            </div>
          </Container>
        </div>
      )}

      {/* Bestsellers Section Section */}
      <Container className="py-5 mt-5">
        <div className="text-center mb-5">
          <h6 className="text-danger fw-bold text-uppercase tracking-wider">Most Popular</h6>
          <h2 className="display-5 fw-bold text-dark">Our Bestsellers</h2>
          <div className="mx-auto bg-danger mt-3" style={{ height: '4px', width: '60px', borderRadius: '2px' }}></div>
        </div>
        {loadingBestsellers ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        ) : bestsellers.length === 0 ? (
          <div className="text-center py-4 text-muted">No bestsellers available right now.</div>
        ) : null}
        <Row>
          {bestsellers.map((item) => (
            <Col md={4} key={item._id} className="mb-4">
              <Card className="border-0 shadow-lg rounded-4 overflow-hidden product-card h-100">
                <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
                  <Card.Img variant="top" src={item.image} className="h-100 w-100 object-fit-cover hover-zoom" />
                  <div className="position-absolute top-0 end-0 m-3 align-items-center d-flex justify-content-center bg-danger rounded-circle text-white shadow" style={{ width: '45px', height: '45px' }}>
                    <i className="bi bi-star-fill text-white"></i>
                  </div>
                </div>
                <Card.Body className="text-center p-4">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                    <div className="border border-secondary p-1 d-flex align-items-center justify-content-center" style={{ width: '16px', height: '16px' }}>
                      <div className={`rounded-circle ${item.categoryId?.categoryName === 'Non-Veg' ? 'bg-danger' : 'bg-success'}`} style={{ width: '8px', height: '8px' }}></div>
                    </div>
                    <h4 className="fw-bold mb-0">{item.name}</h4>
                  </div>
                  <p className="text-danger fs-5 fw-bold mb-4">₹{item.price}</p>
                  <div className="d-flex gap-2">
                    <Button variant="danger" className="rounded-pill flex-grow-1 fw-bold py-2" onClick={async () => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      if (!getItemInCart(item._id)) {
                        await handleAddToCart(item);
                      }
                      navigate('/cart');
                    }}>
                      Order Now
                    </Button>
                    <Button variant={getItemInCart(item._id) ? "success" : "outline-danger"} 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: '45px', height: '45px' }}
                      title={getItemInCart(item._id) ? "In Cart" : "Add to Cart"}
                      onClick={() => {
                        if (!user) {
                          navigate('/login');
                          return;
                        }
                        if (!getItemInCart(item._id)) {
                          handleAddToCart(item);
                        } else {
                          navigate('/cart');
                        }
                      }}>
                      {getItemInCart(item._id) ? (
                        <i className="bi bi-check-lg"></i>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-cart-plus" viewBox="0 0 16 16">
                          <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9V5.5z"/>
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                        </svg>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Categories Section */}
      <div className="bg-light py-5">
        <Container className="py-4">
          <div className="text-center mb-5">
            <h6 className="text-danger fw-bold text-uppercase tracking-wider">Explore</h6>
            <h2 className="display-5 fw-bold text-dark">Menu Categories</h2>
            <div className="mx-auto bg-danger mt-3" style={{ height: '4px', width: '60px', borderRadius: '2px' }}></div>
          </div>
          <Row>
            {Object.entries(categoryImages).map(([cat, img], index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden category-card text-white h-100"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/menu', { state: { category: cat } })}>
                  <div style={{ height: '240px', position: 'relative' }}>
                    <Card.Img src={img} className="h-100 w-100 object-fit-cover" />
                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))' }}></div>
                    <div className="position-absolute bottom-0 start-0 w-100 p-4">
                      <h3 className="fw-bold mb-1">{cat}</h3>
                      <p className="mb-0 text-light opacity-75">Explore Collection →</p>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Info Section */}
      <Container className="py-5 my-5">
        <Row className="g-4 text-center">
          <Col md={4}>
            <div className="p-4 rounded-4 bg-white shadow-sm h-100 d-flex flex-column align-items-center">
              <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-4 text-danger" style={{ width: '80px', height: '80px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                </svg>
              </div>
              <h4 className="fw-bold">Fast Delivery</h4>
              <p className="text-muted">Hot and fresh pizzas delivered to your doorstep in under 30 minutes.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 rounded-4 bg-white shadow-sm h-100 d-flex flex-column align-items-center">
              <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-4 text-danger" style={{ width: '80px', height: '80px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zM8 11.5c-2.481 0-4.5-2.019-4.5-4.5S5.519 2.5 8 2.5s4.5 2.019 4.5 4.5-2.019 4.5-4.5 4.5z"/>
                  <path d="M8 8.5a.5.5 0 0 0 .5-.5c0-1.103.897-2 2-2a.5.5 0 0 0 0-1c-1.654 0-3 1.346-3 3 0 .276.224.5.5.5z"/>
                </svg>
              </div>
              <h4 className="fw-bold">Fresh Ingredients</h4>
              <p className="text-muted">We use only the freshest, high-quality ingredients for our pizzas.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 rounded-4 bg-white shadow-sm h-100 d-flex flex-column align-items-center">
              <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-4 text-danger" style={{ width: '80px', height: '80px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                </svg>
              </div>
              <h4 className="fw-bold">Expert Chefs</h4>
              <p className="text-muted">Our master chefs craft every pizza with passion and perfection.</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-5 mt-auto">
        <Container>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <h4 className="fw-bold mb-3">Pizza Store</h4>
              <p className="text-light opacity-75">Delivering authentic wood-fired pizzas crafted with passion and the freshest ingredients.</p>
            </Col>
            <Col md={4} className="mb-4 mb-md-0 d-flex flex-column">
              <h5 className="fw-bold mb-3">Quick Links</h5>
              <a href="/menu" className="text-light text-decoration-none mb-2 opacity-75 hover-white">Our Menu</a>
              <a href="/cart" className="text-light text-decoration-none mb-2 opacity-75 hover-white">Cart</a>
              <a href="/orders" className="text-light text-decoration-none mb-2 opacity-75 hover-white">My Orders</a>
            </Col>
            <Col md={4}>
              <h5 className="fw-bold mb-3">Contact Us</h5>
              <p className="text-light opacity-75 mb-1"><i className="bi bi-geo-alt me-2"></i>123 Pizza Street, Food City</p>
              <p className="text-light opacity-75 mb-1"><i className="bi bi-telephone me-2"></i>+91 98765 43210</p>
              <p className="text-light opacity-75 mb-0"><i className="bi bi-envelope me-2"></i>support@pizzastore.com</p>
            </Col>
          </Row>
          <hr className="my-4 border-light opacity-25" />
          <div className="text-center text-light opacity-75">
            <p className="mb-0">© 2026 Pizza Store. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Home;