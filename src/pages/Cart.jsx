import { useEffect, useState } from "react";
import { Col, Container, Row, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addToCart,
  decreaseQty,
  deleteProduct,
  clearCart,
} from "../app/features/cart/cartSlice";

const Cart = () => {
  const { cartList } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // middlware to localStorage
  const totalPrice = cartList.reduce(
    (price, item) => price + item.qty * item.price,
    0
  );

  // Generate random order ID
  const generateOrderId = () => {
    return `order${Math.floor(Math.random() * 1000000)}`;
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // API call to notify user about order
  const notifyUserOrder = async (orderId, orderTotal, userEmail) => {
    const apiKey = process.env.REACT_APP_CONTENTSTACK_API_KEY;
    const baseUrl = "https://api.contentstack.io/v3";
    const endpoint = `/content_types/notify_user/entries`;
    const randomParam = Math.random();
    
    const url = `${baseUrl}${endpoint}?form_uid=notify_user&locale=en-us&r=${randomParam}`;

    const requestBody = {
      entry: {
        title: `${orderId}`,
        email_id: userEmail,
        customer_name: "Saideep Mannadiar",
        order_id: orderId,
        order_total: orderTotal,
        company_name: "Multimart LTD",
        year: "2006",
        tags: [],
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include", // Sends cookies including authtoken automatically
        headers: {
          accept: "application/json, text/plain, */*",
          "api_key": apiKey,
          branch: "main",
          "content-type": "application/json",
          authorization: process.env.REACT_APP_CONTENTSTACK_MANAGEMENT_TOKEN,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error_message ||
            errorData.error ||
            `API error: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.json();
      console.log("✅ Order notification sent successfully:", responseData);
      return responseData;
    } catch (error) {
      console.error("❌ Error sending order notification:", error);
      throw error;
    }
  };

  // Buy now callback - makes API call and shows order success modal
  const handleBuyNow = async () => {
    if (cartList.length === 0) return;

    // Validate email
    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setIsSubmitting(true);
    try {
      const orderId = generateOrderId();
      await notifyUserOrder(orderId, totalPrice, email);
      // Show modal on success
      setShowModal(true);
    } catch (error) {
      console.error("Failed to send order notification:", error);
      // Still show modal even if API call fails
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError("");
    }
  };

  // Handle OK button click - clear cart and redirect to home
  const handleModalOk = () => {
    dispatch(clearCart());
    setShowModal(false);
    navigate("/");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // if(CartItem.length ===0) {
    //   const storedCart = localStorage.getItem("cartItem");
    //   setCartItem(JSON.parse(storedCart));
    // }
  }, []);
  return (
    <section className="cart-items">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            {cartList.length === 0 && (
              <h1 className="no-items product">No Items are add in Cart</h1>
            )}
            {cartList.map((item) => {
              const productQty = item.price * item.qty;
              return (
                <div className="cart-list" key={item.id}>
                  <Row>
                    <Col className="image-holder" sm={4} md={3}>
                      <img src={item.imgUrl} alt="" />
                    </Col>
                    <Col sm={8} md={9}>
                      <Row className="cart-content justify-content-center">
                        <Col xs={12} sm={9} className="cart-details">
                          <h3>{item.productName}</h3>
                          <h4>
                            ${item.price}.00 * {item.qty}
                            <span>${productQty}.00</span>
                          </h4>
                        </Col>
                        <Col xs={12} sm={3} className="cartControl">
                          <button
                            className="incCart"
                            onClick={() =>
                              dispatch(addToCart({ product: item, num: 1 }))
                            }
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                          <button
                            className="desCart"
                            onClick={() => dispatch(decreaseQty(item))}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                        </Col>
                      </Row>
                    </Col>
                    <button
                      className="delete"
                      onClick={() => dispatch(deleteProduct(item))}
                    >
                      <ion-icon name="close"></ion-icon>
                    </button>
                  </Row>
                </div>
              );
            })}
          </Col>
          <Col md={4}>
            <div className="cart-total">
              <h2>Cart Summary</h2>
              <div className=" d_flex">
                <h4>Total Price :</h4>
                <h3>${totalPrice}.00</h3>
              </div>
              {cartList.length > 0 && (
                <>
                  <div className="email-input-container">
                    <label htmlFor="checkout-email" className="email-label">
                      Email Address <span className="required-asterisk">*</span>
                    </label>
                    <input
                      type="email"
                      id="checkout-email"
                      className={`email-input ${emailError ? "email-input-error" : ""}`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      disabled={isSubmitting}
                    />
                    {emailError && (
                      <span className="email-error-message">{emailError}</span>
                    )}
                  </div>
                  <button
                    className="buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Buy Now"}
                  </button>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Order Success Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="order-success-modal"
      >
        <Modal.Body className="order-modal-body">
          <div className="order-success-content">
            <div className="success-icon">
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your purchase. Your order has been confirmed.</p>
            <button className="modal-ok-btn" onClick={handleModalOk}>
              OK
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default Cart;
