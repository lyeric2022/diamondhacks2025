import { useEffect, useState } from "react";
const DisplayUser = () => {
	const local_url = "http://localhost:5050/";
	const [users, setUsers] = useState([]); // State to store user data

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
		</div>
	  );
}

export default DisplayUser