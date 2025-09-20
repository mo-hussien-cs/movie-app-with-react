import React from "react";
import searchIcon from "../assets/search.svg";

const Search = ({ searchTerm, setsearchTerm }) => {
  return (
    <div className="search">
      <div>
        <img src={searchIcon} alt="" />
        <input
          type="text"
          placeholder="you can search of thousands of movies"
          value={searchTerm}
          onChange={(e) => setsearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
