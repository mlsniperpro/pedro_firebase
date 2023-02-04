import "./App.css";
import { Auth } from "./components/auth";
import { db, auth, storage } from "./config/firebase";
import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  updateDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

export default function App() {
  const [movieList, setMovieList] = useState([]);
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newMovieReleaseDate, setNewMovieReleaseDate] = useState(0);
  const [newMovieReceivedOscar, setNewMovieReceivedOscar] = useState(false);

  //File Upload
  const [file, setFile] = useState(null);

  const [updatedTitle, setUpdatedTitle] = useState("");
  const getMovies = async () => {
    //Read data from datasbase and set it to movieList
    try {
      const data = await getDocs(collection(db, "movies"));
      const movies = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMovieList(movies);
    } catch (error) {
      console.log(error);
    }
  };
  const deleteMovie = async (id) => {
    //Delete movie from database
    try {
      await deleteDoc(doc(db, "movies", id));
    } catch (error) {
      console.log(error);
    }
  };

  const uploadFile = async () => {
    //Upload file to storage
    if(!file) return;
    try {
      const storageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(storageRef, file);
    } catch (error) {
      console.log(error);
    }
  };



  const updateMovieTitle = async (id) => {
    //Update movie title in database
    try {
      await updateDoc(doc(db, "movies", id), {
        title: updatedTitle,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMovies();
  }, []);
  const submitMovie = async () => {
    //Add new movie to database
    try {
      const docRef = await addDoc(collection(db, "movies"), {
        title: newMovieTitle,
        releaseDate: newMovieReleaseDate,
        receivedOscar: newMovieReceivedOscar,
        userId: auth?.currentUser?.uid,
      });
      console.log(docRef);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <Auth />
      <div>
        <input
          type="text"
          onChange={(e) => setNewMovieTitle(e.target.value)}
          placeholder="movie title"
        />
        <input
          type="number"
          onChange={(e) => setNewMovieReleaseDate(Number(e.target.value))}
          placeholder="release date"
        />
        <input
          type="checkbox"
          checked={newMovieReceivedOscar}
          onChange={(e) => setNewMovieReceivedOscar(e.target.checked)}
          placeholder="received oscar"
        />
        <label htmlFor="">Received an Oscar</label>
        <button onClick={submitMovie}>Add Movie</button>
      </div>
      <div className="movie-list">
        {movieList.map((movie) => (
          <div className="movie" key={movie.id}>
            <h2 style={{ color: movie.receivedOscar ? "green" : "red" }}>
              {movie.title}
            </h2>
            <p>Date : {movie.releaseDate}</p>
            <button onClick={()=>deleteMovie(movie.id)}>Delete Movie</button>
            <input
              type="text"
              onChange={(e) => setUpdatedTitle(e.target.value)}
              placeholder="new title"
            />
            <button onClick={()=>updateMovieTitle(movie.id)}>Update Title</button>
          </div>
        ))}

      </div>
      <div>
        <input type ="file" 
        onChange={(e)=> setFile(e.target.files[0])}/>
        <button onClick={uploadFile}>Upload File</button>
      </div>
    </div>
  );
}
