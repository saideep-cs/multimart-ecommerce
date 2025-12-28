import { useState } from "react";
import "./searchbar.css";
// import useDebounce from "../../hooks/useDebounce";
const SearchBar = ({ setFilterList, products = [] }) => {
  const [searchWord, setSearchWord] = useState(null);
  // const debounceSearchWord = useDebounce(searchWord, 300);
  const handelChange = (input) => {
    const value = input.target.value;
    setSearchWord(value);
    if (!value || value.trim() === '') {
      // If search is empty, show all products
      setFilterList(products);
    } else {
      setFilterList(
        products.filter((item) =>
          item.productName?.toLowerCase().includes(value?.toLowerCase())
        )
      );
    }
  };
  return (
    <div className="search-container">
      <input type="text" placeholder="Search..." onChange={handelChange} />
      <ion-icon name="search-outline" className="search-icon"></ion-icon>
    </div>
  );
};

export default SearchBar;
