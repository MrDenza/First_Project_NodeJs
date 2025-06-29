import { Outlet } from "react-router-dom";
import "./PostsLayout.css";

const PostsLayout = () => {
    return (
        <div className="postslayout__container">
            <Outlet />
        </div>
    );
};

export default PostsLayout;