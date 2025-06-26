import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import brandpage from './cars'


const Brand =() => {
const { brand } = useParams();
const [ cars, setCar ] = useState([]);
const [ carDetails, setCarDetails ] = useState(null);
const [ loading, setLoading ] = useState(true);
const [ error, setError ] = useState(null);



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
      <h1>Details for {carDetails.brand || brand}</h1>
      <div className="border p-4 rounded shadow">
        {/* Example: Displaying properties of carDetails. Adjust to your data structure. */}
        {carDetails.image && <img src={carDetails.image} alt={carDetails.name || brand} style={{maxWidth: '300px', display: 'block', margin: 'auto'}} />}
        <p><strong>Brand:</strong> {carDetails.brand}</p>
        <p><strong>Model:</strong> {carDetails.model }</p>
        <p><strong>Price:</strong> {carDetails.price} </p>
        <p><strong>Year:</strong> {carDetails.year}</p>
        <p><strong>Made In</strong> {carDetails.madeIn}</p>
        <p><strong>Mileage:</strong> {carDetails.mileage}</p>
        <p><strong>Fuel Type:</strong> {carDetails.fuelType}</p>
        <p><strong>Transmission:</strong> {carDetails.transmission}</p>
        <p><strong>Body Type</strong> {carDetails.bodyType}</p>
        <p><strong>Color:</strong> {carDetails.color}</p>
        <p><strong>Seats</strong> {carDetails.seats}</p>
        <p><strong>Doors:</strong> {carDetails.doors}</p>
        <p><strong>Engine size:</strong> {carDetails.engineSize}</p>
        <p><strong>Status:</strong> {carDetails.status}</p>
        <p><strong>Created at</strong> {carDetails.createdAt}</p>
        <p><strong>Other Details:</strong> {carDetails.otherDescription}</p>
      </div>
    </div>
  
  </div>
)
}
export default Brand;