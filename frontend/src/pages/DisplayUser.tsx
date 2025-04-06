import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
const DisplayUser = () => {
	const local_url = "http://localhost:5050/";
	const [users, setUsers] = useState([]); // State to store user data
	const navigate = useNavigate()

	const fetchUsers = async () => {
		try {
		  const response = await fetch(local_url + "users/");
		  if (response.ok) {
			const data = await response.json();
			setUsers(data); // Store the fetched data in state
		  }
		} catch (error) {
		  console.log(error);
		}
	  };
	
	  useEffect(() => {
		fetchUsers();
	  }, []);

	  return (
		<div>
		  <ul>
			{users.map((user: any, index: number) => (
			  <li key={index}>{user.name}</li> // Replace 'name' with the actual field in your user data
			))}
		  </ul>
		  <p>landing</p>
		  <button onClick={()=> {navigate("/voice-chat")}}>GO TO VOICE</button>
		</div>
	  );
}

export default DisplayUser