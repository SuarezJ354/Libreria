import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/Auth/PrivateRoute";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import '../node_modules/bootstrap-icons/font/bootstrap-icons.css'
import '../node_modules/@fortawesome/fontawesome-free/css/all.min.css'

import ChapterForm from "./Admin/pages/ChapterForm";
import BookForm from "./Admin/components/BookForm";
import Dashboard from "./Admin/pages/dashboard";
import Books from "./Admin/pages/Books";
import UsersPage from "./Admin/pages/UsersPage";
import BooksByCategory from "./frontend/pages/BooksByCategory";

import Login from "./frontend/pages/login";
import Register from "./frontend/pages/Register";

import Library from "./frontend/pages/Library";
import FavoriteBooks from "./frontend/pages/FavoriteBooks";
import CategoriesBook from "./frontend/pages/CategoriesBook";
import BooksDetails from "./frontend/pages/BooksDetails";
import ChapterReader from "./frontend/pages/ChapterReader";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<PublicLayout />}>
            <Route index element={<Library />} />
            <Route path="favorite-books" element={<FavoriteBooks />} />
            <Route path="my-categories" element={<CategoriesBook />} />
            <Route path="/book/:id" element={<BooksDetails />} />
            <Route path="/capitulos/:libroId/:numeroCapitulo" element={<ChapterReader />} />
            <Route path="/books/category/:categoria" element={<BooksByCategory />} />
            


        </Route>

        {/* Rutas privadas / dashboard */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
          }>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="users" element={<UsersPage/>}/>
          <Route path="create-books" element={<BookForm />} />
          <Route path="edit-books/:id" element={<BookForm />} />
          <Route path="books/:bookId/chapters" element={<ChapterForm/>}/>


        </Route>
        
          <Route path="login" element={<Login/>}/>
          <Route path="register" element={<Register/>}/>
          <Route path="*" element={<NotFound/>}/>


      </Routes>
    </AuthProvider>

  );
}

export default App;

