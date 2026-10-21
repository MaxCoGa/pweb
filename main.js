const searchBar = document.getElementById('search-bar');
const resultsContainer = document.getElementById('results-container');
const packageFilter = document.getElementById('package-filter');
let packages = [];

function getPackagesUrl(filter) {
  switch (filter) {
    case 'stable':
      return 'https://raw.githubusercontent.com/MaxCoGa/paran-packages/refs/heads/test/paran_packages_stable';
    case 'latest':
      return 'https://raw.githubusercontent.com/MaxCoGa/paran-packages/refs/heads/test/paran_packages_latest';
    case 'community':
      return 'https://raw.githubusercontent.com/MaxCoGa/paran-packages/refs/heads/test/paran_packages_community';
    default:
      return 'https://raw.githubusercontent.com/MaxCoGa/paran-packages/refs/heads/test/paran_packages_stable'; // Default to stable
  }
}

async function fetchPackages(filter) {
  const packagesUrl = getPackagesUrl(filter);
  try {
    const response = await fetch(packagesUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text(); // Get data as plain text
    packages = data.split('\n') // Split into lines
      .filter(line => line.trim() !== '') // Remove empty lines
      .map(line => {
        const parts = line.split(' '); // Split each line by spaces
        // Ensure there are enough parts before accessing indices
        if (parts.length >= 5) {
          return {
            name: parts[0],
            version: parts[1],
            sha256: parts[2],
            url: parts[3],
            updateFlag: parts[4]
          };
        } else {
          console.warn('Skipping malformed line:', line);
          return null; // Return null for malformed lines
        }
      })
      .filter(pkg => pkg !== null); // Filter out null entries

    displayPackages(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    resultsContainer.innerHTML = '<p>Error loading packages.</p>';
    displayPackages([]); // Clear previous results on error
  }
}

function displayPackages(packagesToDisplay) {
  resultsContainer.innerHTML = '';
  if (packagesToDisplay.length === 0) {
    resultsContainer.innerHTML = '<p>No packages found.</p>';
    return;
  }
  packagesToDisplay.forEach(pkg => {
    const packageElement = document.createElement('div');
    packageElement.classList.add('package-item');
    packageElement.innerHTML = `
      <h3>${pkg.name}</h3>
      <p>Version: ${pkg.version}</p>
      <p>SHA256: ${pkg.sha256}</p>
      <p><a href="${pkg.url}" target="_blank">${pkg.url}</a></p>
    `;
    packageElement.dataset.packageName = pkg.name; // Store data attributes for modal
    resultsContainer.appendChild(packageElement);
  });
}

searchBar.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredPackages = packages.filter(pkg => {
    return (
      pkg.name.toLowerCase().includes(searchTerm) ||
      pkg.sha256.toLowerCase().includes(searchTerm)
    );
  });
  displayPackages(filteredPackages);
});

packageFilter.addEventListener('change', (e) => {
  const selectedFilter = e.target.value;
  fetchPackages(selectedFilter);
});

// Initial fetch with the default filter (stable)
fetchPackages('stable');

resultsContainer.addEventListener('click', (e) => {
  const packageItem = e.target.closest('.package-item');
  if (packageItem) {
    const packageName = packageItem.dataset.packageName;
    // Navigate to package-detail.html with package name as query parameter
    window.location.href = `package-detail.html?name=${encodeURIComponent(packageName)}`;
  }
});
