import { Query, Client, Databases, ID } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") // Your API Endpoint
  .setProject(PROJECT_ID); // Your project ID

const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  // use appwrite sdk to check if document with searchTerm exists in collection
  // if exists, update the count
  // if not, create a new document with count 1
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);
    if (result.total > 0) {
      const document = result.documents[0];
      console.log("Found doc:", document);
  console.log("Current count:", document.count);

      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, document.$id, {
        count: Number(document.count) + 1,
      });
      
    } else {
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie?.id || null,
        poster_url: `https://image.tmdb.org/t/p/w500${
          movie?.poster_path || null
        }`,
        title: movie?.title || null,
        overview: movie?.overview || null,
      });
    }
  } catch (error) {
    console.log("error updating search count", error);
  }
};

export const getTrendingMovies = async () => {
    try {
         const result = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
          Query.orderDesc("count"),
          Query.limit(5),
        ]);
        return result.documents;
    } catch (error) {
        console.log("error fetching trending movies", error);
    }
}