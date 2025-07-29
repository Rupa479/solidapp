import 'leaflet/dist/leaflet.css';
import { onMount, createSignal, For, onCleanup, createEffect } from 'solid-js';
import L from 'leaflet';
import SearchBar from './components/SearchBar';
import { zipCodes } from './zipCodes';
import { projects } from './projects';
import xout from './assets/cross-svgrepo-com.svg';

const App = () => {
  let mapRef;
  let map;
  const [location, setLocation] = createSignal(null);
  const [userDenied, setUserDenied] = createSignal(false);

  const [placeholder, setPlaceholder] = createSignal('Enter a zip code within Houston');
  const [popupProjects, setPopupProjects] = createSignal([]);

  const defaultLocation = [29.76328, -95.36327];

  function searchProjectsByZip(zip) {
    const results = projects.filter((project) =>
      project.zipCode.some((z) => z === Number(zip))
    );

    if (results.length > 0) {
      setPopupProjects(results);
    } else {
      setPopupProjects([]);
    }
  }

  onMount(() => {
    map = L.map(mapRef).setView(defaultLocation, 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const removeLeafletFlag = () => {
      document.querySelectorAll('.leaflet-attribution-flag').forEach(el => el.remove());
    };

    removeLeafletFlag();

    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const flagElement = node.querySelector?.('.leaflet-attribution-flag')
                || (node.classList?.contains('leaflet-attribution-flag') ? node : null);
              if (flagElement) {
                flagElement.remove();
              }
            }
          });
        }
      }
      removeLeafletFlag();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    projects.forEach((project) => {
      project.points.forEach(([lat, lng, label]) => {
        const marker = L.marker([lat, lng]).addTo(map);

        const popupContent = `
          <a href="${project.link}" target="_blank" rel="noopener noreferrer" style="font-weight:bold; text-decoration:none; color:#007bff;">
            ${label}
          </a>
        `;

        marker.bindPopup(popupContent, { closeOnClick: false, autoClose: false, autopan: false });

        marker.on('mouseover', () => {
          marker.openPopup();

          setPopupProjects(prev => {
            if (!prev.some(p => p.projectName === project.projectName)) {
              return [...prev, project];
            }
            return prev;
          });
        });

        marker.on('touchstart', () => {
          marker.openPopup();

          setPopupProjects(prev => {
            if (!prev.some(p => p.projectName === project.projectName)) {
              return [...prev, project];
            }
            return prev;
          });
        });

        marker.on('mouseout', () => {
          marker.closePopup();
        });
      });
    });

    map.setView(defaultLocation, 11);

    createEffect(() => {
      const getUserLocation = () => {
        return new Promise((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              position => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
              error => reject(error.message)
            );
          } else {
            reject("Geolocation is not supported by this browser.");
          }
        });
      };

      getUserLocation()
        .then(location => {
          setLocation(location);
          map.setView([location.latitude, location.longitude], 13);
        })
        .catch(error => {
          if (error === "User denied Geolocation") {
            setUserDenied(true);
          }
        });
    });

    onCleanup(() => {
      map.remove();
      observer.disconnect();
    });
  });

  const zipZoom = (zip) => {
    const userZip = parseInt(zip, 10);
    const match = zipCodes.find((item) => item[0] === userZip);

    if (match) {
      const [, latitude, longitude] = match;
      map.flyTo([latitude, longitude], 13);
      searchProjectsByZip(userZip);
    } else {
      setPopupProjects([]);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <SearchBar onSearch={zipZoom} placeholder1={placeholder()} />
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      <div class="rectangle-container">
        <For each={popupProjects()}>
          {(project, index) => (
            <div class="pop-up-rectangle glassmorphism">
              <div class="exit">
                <img
                  src={xout}
                  height="24px"
                  width="24px"
                  id="x-out"
                  onClick={() =>
                    setPopupProjects((prev) => prev.filter((_, i) => i !== index()))
                  }
                />
              </div>
              <h3>{project.projectName}</h3>
              <p>{project.start} - {project.completion}</p>
              <p>Project stage: {project.constructionStage}</p>
              <p><a href={project.link} target="_blank" rel="noopener noreferrer">Click to learn more</a></p>
              <p>{project.summary}</p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default App;
