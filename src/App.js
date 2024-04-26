import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [thumbnails, setThumbnails] = useState([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null); 
  const [navbarItems, setNavbarItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [selectedRole, setSelectedRole] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    // Fetch
    axios.get('https://staging.ina17.com/data.json')
      .then(response => {
        // Sort the data array by displayName in ascending order
        const sortedData = response.data.sort((a, b) => a.displayName.localeCompare(b.displayName));
        const groupedByRole = {};
        sortedData.forEach(item => {
          if (!groupedByRole[item.role]) {
            groupedByRole[item.role] = [];
          }
          groupedByRole[item.role].push(item);
        });
        groupedByRole['All'] = sortedData;
        // Update state with sorted data
        setThumbnails(sortedData);
        setNavbarItems(groupedByRole);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setSelectedThumbnail(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {document.removeEventListener('mousedown', handleClickOutside);};
  }, []);

  const handleThumbnailClick = (thumbnail) => {
    setSelectedThumbnail(thumbnail);
  };
  const handleClosePopup = () => {
    setSelectedThumbnail(null);
  };
  
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleSearch = () => {
    console.log('Search query:', searchQuery);
  };
  const handleNavbarItemClick = (role) => {
    setSelectedRole(role === 'All' ? null : role); // Set selected role to null when "All" is clicked
    setSearchQuery('');
  };
  const filteredThumbnails = selectedRole ?
    thumbnails.filter(thumbnail =>
      thumbnail.role === selectedRole &&
      thumbnail.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    ) :
    thumbnails.filter(thumbnail =>
      thumbnail.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="body">
      <header className="header">
      </header>
      <nav className="navbar navbar-dark bg-black">
        <ul className="navbar-nav">
          {Object.keys(navbarItems).map(role => (
            <li key={role} onClick={() => handleNavbarItemClick(role)}>
              {role}
            </li>
          ))}
        </ul>
      </nav>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
        <button onClick={handleSearch}>Search</button> {/* Search button */}
      </div>
      <div className="total-hero">Total Hero: {filteredThumbnails.length}</div>

      <div className="thumbnails">
        {filteredThumbnails.map(thumbnail => (
          <div key={thumbnail.displayName} className="thumbnail" onClick={() => handleThumbnailClick(thumbnail)}>
            <img src={thumbnail.fullPortrait} alt={thumbnail.displayName} />
            <h3 className="display-name">{thumbnail.displayName}</h3>
          </div>
        ))}
      </div>

      
      {selectedThumbnail && (
        <div className="popup-detail">
          <div className="popup-content" ref={popupRef}>
            <span className="close" onClick={handleClosePopup}>×</span>
            <div className="thumbnail-info">
              <img src={selectedThumbnail.displayIcon} alt={selectedThumbnail.displayIcon}/>
              <div className="text-info">
                <h2>{selectedThumbnail.displayName}</h2>
                <h3>Role: {selectedThumbnail.role}</h3>
                <p>{selectedThumbnail.description}</p>
              </div>
            </div>
            <div className="video-section">
              <iframe
                width="500"
                height="200"
                src={`https://www.youtube.com/embed/${selectedThumbnail.video}`}
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      )}




    </div>
  );
};

export default App;
