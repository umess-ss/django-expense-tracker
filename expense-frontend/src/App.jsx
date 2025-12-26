import React, {useState, useEffect} from "react";
import api from "./api";

function App() {
  const [categories, setCategories] = useState([]);


useEffect(() => {
    api.get('category/', {
      params: {
        'type': 'EXPENSE' // Fixed the space here
      },
      headers: {
        'Authorization': 'Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b' 
      },
    })
    .then(res => {
      // Check if data is inside 'results' (Django Pagination)
      const data = res.data.results ? res.data.results : res.data;
      setCategories(data);
    })
    .catch(err => console.log(err));
  }, []);

  return(
    <div>
      <h1>Expense Categories</h1>
      <ul>
        {categories.map((cat)=>(
          <li key={cat.id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  )

}
export default App;