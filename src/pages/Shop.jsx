import { Col, Container, Row } from "react-bootstrap";
import FilterSelect from "../components/FilterSelect";
import SearchBar from "../components/SeachBar/SearchBar";
import { Fragment, useState, useEffect } from "react";
import { fetchProducts } from "../services/contentstackService";
import ShopList from "../components/ShopList";
import Banner from "../components/Banner/Banner";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import Loader from "../components/Loader/Loader";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filterList, setFilterList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useWindowScrollToTop();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const allProducts = await fetchProducts();
        setProducts(allProducts);
        // Default filter: show sofa category
        const defaultFilter = allProducts.filter((item) => item.category === "sofa");
        setFilterList(defaultFilter.length > 0 ? defaultFilter : allProducts);
        setError(null);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products');
        setProducts([]);
        setFilterList([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Fragment>
        <Banner title="product" />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>{error}</p>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Banner title="product" />
      <section className="filter-bar">
        <Container className="filter-bar-contianer">
          <Row className="justify-content-center">
            <Col md={4}>
              <FilterSelect setFilterList={setFilterList} products={products} />
            </Col>
            <Col md={8}>
              <SearchBar setFilterList={setFilterList} products={products} />
            </Col>
          </Row>
        </Container>
        <Container>
          <ShopList productItems={filterList} />
        </Container>
      </section>
    </Fragment>
  );
};

export default Shop;
