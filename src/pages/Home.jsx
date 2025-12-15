import { Fragment, useState, useEffect } from "react";
import Wrapper from "../components/wrapper/Wrapper";
import Section from "../components/Section";
import SliderHome from "../components/Slider";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import { fetchHomePage } from "../services/contentstackService";
import Loader from "../components/Loader/Loader";

const Home = () => {
  const [homeData, setHomeData] = useState(null);
  console.log("🚀 ~ Home ~ homeData:", homeData)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useWindowScrollToTop();

  useEffect(() => {
    const loadHomePage = async () => {
      try {
        setLoading(true);
        const data = await fetchHomePage();
        setHomeData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading home page:', err);
        setError('Failed to load home page content');
        setHomeData(null);
      } finally {
        setLoading(false);
      }
    };

    loadHomePage();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error || !homeData) {
    return (
      <Fragment>
        <SliderHome />
        <Wrapper />
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>{error || 'Failed to load home page'}</p>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <SliderHome banners={homeData.sections.slider} />
      <Wrapper services={homeData.sections.services} />
      <Section
        title="Big Discount"
        bgColor="#f6f9fc"
        productItems={homeData.sections.discountProducts}
      />
      <Section
        title="New Arrivals"
        bgColor="white"
        productItems={homeData.sections.newArrivals}
      />
      <Section 
        title="Best Sales" 
        bgColor="#f6f9fc" 
        productItems={homeData.sections.bestSales} 
      />
      {/* Footer is rendered in App.js, but we can pass data if needed */}
    </Fragment>
  );
};

export default Home;
