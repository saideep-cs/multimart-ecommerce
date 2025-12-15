import { Fragment, useEffect, useState } from "react";
import Banner from "../components/Banner/Banner";
import { Container } from "react-bootstrap";
import ShopList from "../components/ShopList";
import { useParams } from "react-router-dom";
import ProductDetails from "../components/ProductDetails/ProductDetails";
import ProductReviews from "../components/ProductReviews/ProductReviews";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import { fetchProductById, fetchProducts } from "../services/contentstackService";
import Loader from "../components/Loader/Loader";

const Product = () => {
  const { id } = useParams();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        
        // Fetch the selected product
        const product = await fetchProductById(id);
        setSelectedProduct(product);
        
        // Fetch all products to find related ones
        const allProducts = await fetchProducts();
        const related = allProducts.filter(
          (item) =>
            item.category === product?.category &&
            item.id !== product?.id
        );
        setRelatedProducts(related);
        
        setError(null);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product');
        setSelectedProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  useWindowScrollToTop();

  if (loading) {
    return <Loader />;
  }

  if (error || !selectedProduct) {
    return (
      <Fragment>
        <Banner title="Product" />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>{error || 'Product not found'}</p>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Banner title={selectedProduct?.productName} />
      <ProductDetails selectedProduct={selectedProduct} />
      <ProductReviews selectedProduct={selectedProduct} />
      <section className="related-products">
        <Container>
          <h3>You might also like</h3>
        </Container>
        <ShopList productItems={relatedProducts} />
      </section>
    </Fragment>
  );
};

export default Product;
