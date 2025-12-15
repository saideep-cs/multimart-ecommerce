import React, { useState, useEffect } from "react"
import "./style.css"
import { Col, Container, Row } from "react-bootstrap"
import { fetchFooterContent } from "../../services/contentstackService"

const Footer = ({ footerContent: propFooterContent }) => {
  const [footerContent, setFooterContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If footer content is provided as props, use it directly
    if (propFooterContent) {
      setFooterContent(propFooterContent);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from CMS
    const loadFooterContent = async () => {
      try {
        setLoading(true);
        const content = await fetchFooterContent();
        setFooterContent(content);
      } catch (err) {
        console.error('Error loading footer content:', err);
        // Use default content if CMS fetch fails
        setFooterContent({
          logo: 'Multimart',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.',
          aboutUs: ['Careers', 'Our Stores', 'Our Cares', 'Terms & Conditions', 'Privacy Policy'],
          customerCare: ['Help Center', 'How to Buy', 'Track Your Order', 'Corporate & Bulk Purchasing', 'Returns & Refunds'],
          contactInfo: {
            address: '70 Washington Square South, New York, NY 10012, United States',
            email: 'uilib.help@gmail.com',
            phone: '+1 1123 456 780'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadFooterContent();
  }, [propFooterContent]);

  if (loading || !footerContent) {
    return (
      <footer>
        <Container>
          <Row className="footer-row">
            <Col md={12} style={{ textAlign: 'center', padding: '20px' }}>
              <p>Loading...</p>
            </Col>
          </Row>
        </Container>
      </footer>
    );
  }

  return (
    <footer>
      <Container>
        <Row className="footer-row">
          <Col md={3} sm={5} className='box'>
            <div className="logo">
              <ion-icon name="bag"></ion-icon>
              <h1>{footerContent.logo || 'Multimart'}</h1>
            </div>
            <p>{footerContent.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}</p>
          </Col>
          <Col md={3} sm={5} className='box'>
            <h2>About Us</h2>
            <ul>
              {footerContent.aboutUs && footerContent.aboutUs.length > 0 ? (
                footerContent.aboutUs.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <>
                  <li>Careers</li>
                  <li>Our Stores</li>
                  <li>Our Cares</li>
                  <li>Terms & Conditions</li>
                  <li>Privacy Policy</li>
                </>
              )}
            </ul>
          </Col>
          <Col md={3} sm={5} className='box'>
            <h2>Customer Care</h2>
            <ul>
              {footerContent.customerCare && footerContent.customerCare.length > 0 ? (
                footerContent.customerCare.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <>
                  <li>Help Center</li>
                  <li>How to Buy</li>
                  <li>Track Your Order</li>
                  <li>Corporate & Bulk Purchasing</li>
                  <li>Returns & Refunds</li>
                </>
              )}
            </ul>
          </Col>
          <Col md={3} sm={5} className='box'>
            <h2>Contact Us</h2>
            <ul>
              {footerContent.contactInfo && (
                <>
                  {footerContent.contactInfo.address && <li>{footerContent.contactInfo.address}</li>}
                  {footerContent.contactInfo.email && <li>Email: {footerContent.contactInfo.email}</li>}
                  {footerContent.contactInfo.phone && <li>Phone: {footerContent.contactInfo.phone}</li>}
                </>
              )}
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
