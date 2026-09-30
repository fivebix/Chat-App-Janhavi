import "../../style/SearchInput.css";

import { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { FiUser } from "react-icons/fi";

import useConversation from "../../zustand/useConversation";
import useSearchUsers from "../../hooks/useSearchUsers";

const SearchInput = () => {
const [search, setSearch] = useState("");

const {
setSelectedConversation,
} = useConversation();

const {
loading,
users,
searchUsers,
clearResults,
} = useSearchUsers();

useEffect(() => {
const timer = setTimeout(() => {
if (search.trim().length >= 2) {
searchUsers(search);
} else {
clearResults();
}
}, 300);

return () => clearTimeout(timer);
}, [search]);

const handleUserSelect = (user) => {
setSelectedConversation(user);
setSearch("");
clearResults();
};

return (
<div className="search-container">
<form
className="search-form"
onSubmit={(e) => e.preventDefault()}
>
<div className="search-box">
<IoSearchSharp className="search-icon" />

<input
type="text"
className="search-input"
placeholder="Search conversations, people..."
value={search}
autoFocus
onChange={(e) =>
setSearch(e.target.value)
}
/>

{loading && (
<div className="search-spinner"></div>
)}
</div>
</form>

{search.trim().length >= 2 && (
<div className="search-results">
{!loading && users.length === 0 ? (
<div className="no-search-results">
<div className="no-search-results-icon">
<IoSearchSharp />
</div>

<div>
<h4>No users found</h4>

<p>
Try searching with another name
or username.
</p>
</div>
</div>
) : (
users.map((user) => (
<button
key={user._id}
type="button"
className="search-result"
onClick={() =>
handleUserSelect(user)
}
>
<div className="search-result-avatar">
{user.profilePic ? (
<img
src={user.profilePic}
alt={user.fullName}
/>
) : (
<FiUser />
)}
</div>

<div className="search-result-info">
<h4>
{user.fullName}
</h4>

<p>
@{user.username}
</p>
</div>
</button>
))
)}
</div>
)}
</div>
);
};

export default SearchInput;