import { Routes, Route } from "react-router-dom";
import { Items } from "./Items";
import { ItemDetail } from "./ItemDetail";
import { UserManagement } from "./UserManagement";
import { Profile } from "./Profile";
import TestApi from "./TestApi";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Items />} />
      <Route path="/items" element={<Items />} />
      <Route path="/items/:id" element={<ItemDetail />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/profile/:id" element={<Profile />} />

      {/* Existing test route */}
      <Route path="/test_api" element={<TestApi />} />
    </Routes>
  );
}

export default App;