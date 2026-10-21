// JavaScript for package-detail.html

document.addEventListener('DOMContentLoaded', () => {
  // Function to get query parameter from URL
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
      const packages = data.split('\n') // Split into lines
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
      return packages; // Return the fetched packages
    } catch (error) {
      console.error('Error fetching packages:', error);
      return []; // Return empty array on error
    }
  }

  function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Get the package name from the URL
  const packageName = getQueryParameter('name');

  async function displayPackageDetails() {
    const mainContent = document.querySelector('main .container');

    if (packageName) {
      // Fetch packages data
      const packages = await fetchPackages('stable'); // You might want to determine the filter dynamically if needed

      // Find the package in the packages array
      const selectedPackage = packages.find(pkg => pkg.name === packageName);

      if (selectedPackage) {
        // Populate the HTML elements with package details
        const packageDetailName = document.getElementById('package-detail-name');
        const packageDetailVersion = document.getElementById('package-detail-version');
        const packageDetailSha256 = document.getElementById('package-detail-sha256');
        const packageDetailUrl = document.getElementById('package-detail-url');

        if (packageDetailName) {
          packageDetailName.textContent = `Name: ${selectedPackage.name}`;
        }
        if (packageDetailVersion) {
          packageDetailVersion.textContent = `Version: ${selectedPackage.version}`;
        }
        if (packageDetailSha256) {
          packageDetailSha256.textContent = `SHA256: ${selectedPackage.sha256}`;
        }
        if (packageDetailUrl) {
          packageDetailUrl.innerHTML = `URL: <a href="${selectedPackage.url}" target="_blank">${selectedPackage.url}</a>`;
        }

      } else {
        // Handle case where package is not found
        if (mainContent) {
          mainContent.innerHTML = '<p>Package not found.</p>';
        }
      }

    } else {
      // Handle case where no package name is in the URL
      if (mainContent) {
        mainContent.innerHTML = '<p>No package specified.</p>';
      }
    }
  }

  displayPackageDetails(); // Call the function to display details
});
