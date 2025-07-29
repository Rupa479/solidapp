import 'leaflet/dist/leaflet.css';
import { onMount, createSignal, For } from 'solid-js';
import L from 'leaflet';
import SearchBar from './components/SearchBar';
import { zipCodes } from './zipCodes';
import { projects } from './projects';
import xout  from './assets/cross-svgrepo-com.svg'
const App = () => {
  let mapRef;
  let map;

  const [placeholder, setPlaceholder] = createSignal('Enter a zip code within Houston');
  const [popupProjects, setPopupProjects] = createSignal([]);

  function searchProjectsByZip(zip) {
    const results = projects.filter((project) =>
      project.zipCode.some((z) => z === Number(zip))
    );

    if (results.length > 0) {
      console.log(`Found ${results.length} projects for zip code ${zip}:`);
      results.forEach((project) => console.log(project.projectName));
      setPopupProjects(results);
    } else {
      console.log(`No projects found for ZIP ${zip}`);
      setPopupProjects([]); // clear rectangles if none found
    }
  }

  onMount(() => {
    map = L.map(mapRef).setView([29.76328, -95.36327], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
  });

  const zipZoom = (zip) => {
    const userZip = parseInt(zip, 10);

    const match = zipCodes.find((item) => item[0] === userZip);

    if (match) {
      const [zip, latitude, longitude] = match;
      map.flyTo([latitude, longitude], 13);
      searchProjectsByZip(userZip);
    } else {
      console.log('ZIP NOT FOUND.');
      setPopupProjects([]); // clear rectangles if no zip match
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <SearchBar onSearch={zipZoom} placeholder1={placeholder()} />
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

      {/* Rectangle container */}
      <div class="rectangle-container">
        <For each={popupProjects()}>
          {(project, index) => (
            <div class="pop-up-rectangle glassmorphism">
              <div class='exit'>
                <img src={xout} height='24px' width='24px' id='x-out' onClick={() => setPopupProjects((prev) => prev.filter((_, i) => i !== index()))}/>
                </div>
              <h3 style='align-items: center'>{project.projectName}

    
              </h3>
             
              <p>{project.start} - {project.completion}</p>
              <p>Project stage: {project.constructionStage}</p>
              <p><a href={project.link}>Click to learn more</a></p>
              <p>{project.summary}</p>
              
              <p></p>

      
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default App;
