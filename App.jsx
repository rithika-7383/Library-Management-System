import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import api from "./services/api";

function Protected({ children, role }) {
  const user = JSON.parse(localStorage.getItem("library_user") || "null");
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("library_user") || "null");
  const logout = () => {
    localStorage.removeItem("library_token");
    localStorage.removeItem("library_user");
    navigate("/login");
  };
  return (
    <div className="app">
      <nav className="navbar">
        <Link className="brand" to="/dashboard">📚 Library LMS</Link>
        <div className="navlinks">
          <Link className={location.pathname === "/dashboard" ? "active" : ""} to="/dashboard">Dashboard</Link>
          <Link className={location.pathname === "/books" ? "active" : ""} to="/books">Books</Link>
          <Link className={location.pathname === "/transactions" ? "active" : ""} to="/transactions">Transactions</Link>
          {user?.role === "admin" && <Link to="/admin">Admin</Link>}
          <button className="logout" onClick={logout}>Logout</button>
        </div>
      </nav>
      <main className="container">{children}</main>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("library_token", data.token);
      localStorage.setItem("library_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) { setError(err.response?.data?.message || "Login failed"); }
  };
  return <AuthBox title="Welcome Back" subtitle="Sign in to your library account">
    {error && <div className="error">{error}</div>}
    <form onSubmit={submit}>
      <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      <button className="primary full">Login</button>
    </form>
    <p className="muted center">New student? <Link to="/register">Create an account</Link></p>
  </AuthBox>;
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("library_token", data.token);
      localStorage.setItem("library_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) { setError(err.response?.data?.message || "Registration failed"); }
  };
  return <AuthBox title="Create Account" subtitle="Register as a library student">
    {error && <div className="error">{error}</div>}
    <form onSubmit={submit}>
      <label>Full Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
      <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type="password" minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      <button className="primary full">Register</button>
    </form>
    <p className="muted center">Already registered? <Link to="/login">Login</Link></p>
  </AuthBox>;
}

function AuthBox({ title, subtitle, children }) {
  return <div className="auth-page"><div className="auth-card"><div className="logo-big">📚</div><h1>{title}</h1><p className="muted">{subtitle}</p>{children}</div></div>;
}

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("library_user"));
  const [stats, setStats] = useState(null);
  const [my, setMy] = useState([]);
  useEffect(() => {
    if (user.role === "admin") api.get("/transactions/stats").then(r=>setStats(r.data));
    api.get("/transactions/my").then(r=>setMy(r.data));
  }, []);
  return <Layout>
    <div className="hero"><div><span className="eyebrow">LIBRARY MANAGEMENT</span><h1>Hello, {user.name} 👋</h1><p>Manage your books and borrowing activity from one place.</p></div><Link className="primary" to="/books">Browse Books</Link></div>
    {user.role === "admin" && stats && <div className="stats">
      <Stat icon="📚" label="Total Books" value={stats.books}/>
      <Stat icon="👩‍🎓" label="Students" value={stats.users}/>
      <Stat icon="📖" label="Currently Issued" value={stats.issued}/>
      <Stat icon="⏰" label="Overdue" value={stats.overdue}/>
    </div>}
    <section className="panel"><div className="section-head"><h2>My Borrowed Books</h2><Link to="/transactions">View all</Link></div>
      {my.filter(t=>t.status==="issued").length ? <TransactionTable items={my.filter(t=>t.status==="issued")} /> : <Empty text="You have no active borrowed books."/>}
    </section>
  </Layout>;
}
function Stat({icon,label,value}) { return <div className="stat"><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></div>; }

function Books() {
  const user = JSON.parse(localStorage.getItem("library_user"));
  const [books,setBooks]=useState([]), [search,setSearch]=useState(""), [error,setError]=useState("");
  const load=()=>api.get("/books",{params:{search}}).then(r=>setBooks(r.data)).catch(e=>setError(e.response?.data?.message||"Failed"));
  useEffect(()=>{load()},[]);
  const issue=async(book)=>{
    try { await api.post("/transactions/issue",{bookId:book._id}); alert("Book issued successfully."); load(); }
    catch(e){alert(e.response?.data?.message||"Could not issue book");}
  };
  return <Layout><div className="section-head"><div><h1>Books</h1><p className="muted">Search and manage library books.</p></div>{user.role==="admin"&&<Link className="primary" to="/admin">Manage Library</Link>}</div>
    <div className="searchbar"><input placeholder="Search title, author or ISBN..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()}/><button className="primary" onClick={load}>Search</button></div>
    {error&&<div className="error">{error}</div>}
    <div className="book-grid">{books.map(book=><div className="book-card" key={book._id}><div className="book-cover">📘</div><div><span className="tag">{book.category}</span><h3>{book.title}</h3><p>by {book.author}</p><p className="muted">ISBN: {book.isbn}</p><div className="book-bottom"><span className={book.availableCopies?"available":"unavailable"}>{book.availableCopies} available</span>{book.availableCopies>0&&<button className="small primary" onClick={()=>issue(book)}>Borrow</button>}</div></div></div>)}</div>
    {!books.length&&<Empty text="No books found."/>}
  </Layout>;
}

function Transactions() {
  const [items,setItems]=useState([]);
  const load=()=>api.get("/transactions").then(r=>setItems(r.data));
  useEffect(()=>{load()},[]);
  const ret=async(id)=>{try{const {data}=await api.put(`/transactions/${id}/return`); alert(`Returned. Fine: ₹${data.fine}`);load()}catch(e){alert(e.response?.data?.message||"Return failed")}};
  return <Layout><div className="section-head"><div><h1>Transactions</h1><p className="muted">Track issued and returned books.</p></div></div><section className="panel"><TransactionTable items={items} onReturn={ret}/></section></Layout>;
}
function TransactionTable({items,onReturn}) {
  return <div className="table-wrap"><table><thead><tr><th>Book</th><th>Borrower</th><th>Issue Date</th><th>Due Date</th><th>Status</th><th>Fine</th><th></th></tr></thead><tbody>{items.map(t=><tr key={t._id}><td><strong>{t.book?.title}</strong><br/><small>{t.book?.author}</small></td><td>{t.user?.name}</td><td>{new Date(t.issueDate).toLocaleDateString()}</td><td>{new Date(t.dueDate).toLocaleDateString()}</td><td><span className={`status ${t.status}`}>{t.status}</span></td><td>₹{t.fine}</td><td>{t.status==="issued"&&onReturn&&<button className="small" onClick={()=>onReturn(t._id)}>Return</button>}</td></tr>)}</tbody></table></div>;
}
function Empty({text}) {return <div className="empty">{text}</div>}

function Admin() {
  const [books,setBooks]=useState([]), [form,setForm]=useState({title:"",author:"",isbn:"",category:"",publisher:"",year:"",quantity:1}), [edit,setEdit]=useState(null);
  const load=()=>api.get("/books").then(r=>setBooks(r.data));
  useEffect(()=>{load()},[]);
  const save=async(e)=>{e.preventDefault();try{if(edit) await api.put(`/books/${edit}`,form);else await api.post("/books",form);setForm({title:"",author:"",isbn:"",category:"",publisher:"",year:"",quantity:1});setEdit(null);load()}catch(err){alert(err.response?.data?.message||"Save failed")}};
  const remove=async(id)=>{if(confirm("Delete this book?")){try{await api.delete(`/books/${id}`);load()}catch(e){alert(e.response?.data?.message||"Delete failed")}}};
  const startEdit=b=>{setEdit(b._id);setForm({title:b.title,author:b.author,isbn:b.isbn,category:b.category,publisher:b.publisher,year:b.year||"",quantity:b.quantity})};
  return <Layout><h1>Admin Panel</h1><p className="muted">Manage the library catalogue.</p><div className="admin-grid"><section className="panel"><h2>{edit?"Edit Book":"Add New Book"}</h2><form onSubmit={save} className="form-grid">
    {["title","author","isbn","category","publisher","year","quantity"].map(k=><label key={k}>{k[0].toUpperCase()+k.slice(1)}<input type={["year","quantity"].includes(k)?"number":"text"} required={["title","author","isbn","category","quantity"].includes(k)} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}
    <div><button className="primary">{edit?"Update Book":"Add Book"}</button>{edit&&<button type="button" className="secondary" onClick={()=>setEdit(null)}>Cancel</button>}</div>
  </form></section><section className="panel"><h2>Book Catalogue</h2><div className="table-wrap"><table><thead><tr><th>Title</th><th>Category</th><th>Copies</th><th>Actions</th></tr></thead><tbody>{books.map(b=><tr key={b._id}><td><strong>{b.title}</strong><br/><small>{b.author}</small></td><td>{b.category}</td><td>{b.availableCopies}/{b.quantity}</td><td><button className="small" onClick={()=>startEdit(b)}>Edit</button> <button className="small danger" onClick={()=>remove(b._id)}>Delete</button></td></tr>)}</tbody></table></div></section></div></Layout>;
}

export default function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/>
    <Route path="/books" element={<Protected><Books/></Protected>}/>
    <Route path="/transactions" element={<Protected><Transactions/></Protected>}/>
    <Route path="/admin" element={<Protected role="admin"><Admin/></Protected>}/>
    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
  </Routes>;
}
