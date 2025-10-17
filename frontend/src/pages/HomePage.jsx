import { useAuthStore } from "../store/authStore";
import { useLogout } from "../hooks/useLogout";

const HomePage = () => {
  const user = useAuthStore((s) => s.user);
  const logOut = useLogout();

  return (
    <>
      <button onClick={logOut}>LogOut</button>
      <div>HomePage</div>
      <div>{user.userId ? user.userId : "user.id"}</div>
      <div>{user.name ? user.name : "user.name"}</div>
      <div>{user.email ? user.email : "user.email"}</div>
      <img src={user.image} alt="image" />
    </>
  );
};

export default HomePage;
