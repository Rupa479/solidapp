import { createSignal } from 'solid-js';
import searchIcon from '../assets/search-alt-1-svgrepo-com.svg';

export default function SearchBar({ onSearch, placeholder1}) {
  const [query, setQuery] = createSignal('');
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const zip = query().trim();
    if (zip) {
      onSearch(zip);
    } else {
      alert("Please enter a zip code");
    }
  };

  return (
    <form class="glassmorphism search-bar" onSubmit={handleSubmit}>
      <input
        id='searchtext'
        type="text"
        placeholder={placeholder1}
        // Do NOT bind value directly, let it update onInput
        onInput={(e) => setQuery(e.target.value)}
      />
      <button type="submit" class="search-icon-btn">
        <img src={searchIcon} alt="Search" />
      </button>
    </form>
  );
}
