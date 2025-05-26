import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import brandpage from './cars'


const Brand =() => {
const { brand } = useParams();
const [ cars, setCar ] = useState([]);
const [ carDetails, setCarDetails ] = useState(null);
const [ loading, setLoading ] = useState(true);
const [ error, setError ] = useState(null);

/*
useEffect((name) => {
brandpage.getByName(name)
.then((response) => response.json())
.then((data) => setCar(data));
}, [brand]);
*/


useEffect(() => {
    if (brand) { // Only fetch if brand (motor name) exists in the URL
      setLoading(true);
      setError(null);
      brandpage.getByName(brand) // Pass the 'brand' (motor name) from useParams
        .then((data) => { // Assuming getByName returns the data directly (e.g., from axios response.data)
          setCarDetails(data);
        })
        .catch((err) => {
          console.error(`Error fetching details for ${brand}:`, err);
          setError(err.message || "Failed to fetch car details.");
          setCarDetails(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setCarDetails(null); // No brand in URL, so no specific car to fetch
      setLoading(false);
    }
  }, [brand]); // Dependency array is correct, effect runs when 'brand' changes

  if (loading) {
    return <div>Loading details for "{brand}"...</div>;
  }
  if (error) {
    return <div>Error loading details for "{brand}": {error}</div>;
  }
  if (!carDetails) {
    return <div>No details found for "{brand}". Ensure the name is correct and the motor exists.</div>;
  }

  
  // Render the details of the single car (carDetails)
  // This part needs to be adapted based on the actual structure of your carDetails object
  
  return (
  <div>
 <h1>cars for {carDetails.name || brand}</h1>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div key={car._id} className="border p-4 rounded shadow">
          {car}
          </div>
        ))}
      </div>

      <div>
      <h1>Details for {carDetails.name || brand}</h1>
      <div className="border p-4 rounded shadow">
        {/* Example: Displaying properties of carDetails. Adjust to your data structure. */}
        {carDetails.image && <img src={carDetails.image} alt={carDetails.name || brand} style={{maxWidth: '300px', display: 'block', margin: 'auto'}} />}
        <p><strong>Model:</strong> {carDetails.model || carDetails.name}</p>
        <p><strong>Price:</strong> {carDetails.price} {carDetails.currency}</p>
        <p><strong>Year:</strong> {carDetails.dateOfRelease}</p>
        <p><strong>Description:</strong> {carDetails.description}</p>
      </div>
    </div>
  
  </div>
)
}
export default Brand;