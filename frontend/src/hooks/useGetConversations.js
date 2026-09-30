import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useGetConversations = () => {
const [loading, setLoading] =
useState(false);

const [conversations, setConversations] =
useState([]);

useEffect(() => {
const getConversations = async () => {
setLoading(true);

try {
const token =
localStorage.getItem(
"chat-token"
);

const res = await fetch(
`${import.meta.env.VITE_API_URL}/api/users`,
{
headers: {
	Authorization: `Bearer ${token}`,
},
}
);

const data =
await res.json();

console.log("Conversations API response:", data);

if (data.error) {
throw new Error(
data.error
);
}

setConversations(
Array.isArray(data)
? data
: []
);
} catch (error) {
console.error(
"Error fetching conversations:",
error.message
);

setConversations([]);

toast.error(
error.message
);
} finally {
setLoading(false);
}
};

getConversations();
}, []);

return {
loading,
conversations,
setConversations,
};
};

export default useGetConversations;