import { useState, useEffect } from "react"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { Container } from "react-bootstrap"
import SlideCard from "./SliderCard/SlideCard"
import { fetchBanners } from "../services/contentstackService"
import Loader from "./Loader/Loader"

const SliderHome = ({ banners: propBanners }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If banners are provided as props, use them directly
    if (propBanners && propBanners.length > 0) {
      setEntries(propBanners);
      setLoading(false);
      setError(null);
      return;
    }

    // Otherwise, fetch from CMS
    const loadBanners = async () => {
      try {
        setLoading(true);
        const banners = await fetchBanners();
        console.log("🚀 ~ loadBanners ~ banners:", banners)
        setEntries(banners);
        setError(null);
      } catch (err) {
        console.error('Error loading banners:', err);
        setError('Failed to load banners');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, [propBanners]);

  const settings = {
    nav: false,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
  }

  if (loading) {
    return (
      <section className='homeSlide'>
        <Container>
          <Loader />
        </Container>
      </section>
    );
  }

  if (error || entries.length === 0) {
    return (
      <section className='homeSlide'>
        <Container>
          {error && <p style={{ textAlign: 'center', padding: '20px' }}>{error}</p>}
        </Container>
      </section>
    );
  }

  return (
    <section className='homeSlide'>
      <Container>
        <Slider {...settings}>
          {entries.map((value, index) => {
            return (
              <SlideCard 
                key={value.id || index} 
                title={value.title} 
                cover={value.cover} 
                desc={value.desc} 
              />
            )
          })}
        </Slider>
      </Container>
    </section>
  )
}

export default SliderHome
