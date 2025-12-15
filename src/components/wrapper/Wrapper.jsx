import React, { useState, useEffect } from "react"
import "./style.css"
import { Col, Container, Row } from "react-bootstrap"
import { fetchServices } from "../../services/contentstackService"
import Loader from "../Loader/Loader"

const Wrapper = ({ services: propServices }) => {
  const [serviceData, setServiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If services are provided as props, use them directly
    if (propServices && propServices.length > 0) {
      setServiceData(propServices);
      setLoading(false);
      setError(null);
      return;
    }

    // Otherwise, fetch from CMS
    const loadServices = async () => {
      try {
        setLoading(true);
        const services = await fetchServices();
        setServiceData(services);
        setError(null);
      } catch (err) {
        console.error('Error loading services:', err);
        setError('Failed to load services');
        setServiceData([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [propServices]);

  if (loading) {
    return (
      <section className='wrapper background'>
        <Container>
          <Loader />
        </Container>
      </section>
    );
  }

  if (error || serviceData.length === 0) {
    return (
      <section className='wrapper background'>
        <Container>
          {error && <p style={{ textAlign: 'center', padding: '20px' }}>{error}</p>}
        </Container>
      </section>
    );
  }

  return (
    <section className='wrapper background'>
      <Container>
        <Row>
          {serviceData.map((val, index) => {
            return (
              <Col md={3} sm={5} xs={9} style={{backgroundColor:val.bg}} className='feature' key={val.id || index}>
                <div className='icon'>
                  <ion-icon name={val.icon}></ion-icon>
                </div>
                <h3>{val.title}</h3>
                <p>{val.subtitle}</p>
              </Col>
            )
          })}
        </Row>
      </Container>
    </section>
  )
}

export default Wrapper
