import { API_KEY, API_URL,RESULTS_PER_PAGE } from "./config.js";
import { AJAX } from "./helpers.js";

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        resultsPerPage: RESULTS_PER_PAGE,
        page: 1
    },
    bookmarks: []
};
const createRecipeObject = function(data){
    const {recipe} = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime : recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key})
    };
};
export const loadRecipe = async function(id){
    console.log(id);
    try {
    debugger;
    const data = await AJAX(`${API_URL}${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id)) state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
    } catch(err){
        console.error(`💥💥💥💥 ${err}`);
        throw err;
    }
}
export const loadSearchResults = async function(query){
    try {
        state.search.query = query;
        console.log(`${API_URL}?search=${query}`);
        const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
        console.log(data);
        state.search.results = data.data.recipes.map(recipe => {
            return {
            id: recipe.id,
            title: recipe.title,
            publisher: recipe.publisher,
            image: recipe.image_url,
            ...(recipe.key && {key: recipe.key})
            }
        })
        state.search.page = 1;
    } catch (err){
        console.error(`💥💥💥💥 ${err}`);
        throw err;
    }
};
export const getSearchResultsPage = function(page = state.search.page){
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage;
    const stop = page * state.search.resultsPerPage;
    return state.search.results.slice(start,stop);
}
export const updateServings = function(newServings){
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    });
    state.recipe.servings = newServings;
}
const persistBookmarks = function(){
    localStorage.setItem('bookmarks',JSON.stringify(state.bookmarks))
}
export const addBookmark = function(recipe){
    // Add bookmark
    state.bookmarks.push(recipe);
    // Mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
    persistBookmarks();
}
export const deleteBookmark = function(id){
    const index = state.bookmarks.findIndex(el => el.id === id)
    state.bookmarks.splice(index,1);
    if(id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmarks();
}
const init = function(){
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}
init();
const clearBookmarks = function(){
    localStorage.clear('bookmarks');
}
export const uploadRecipe = async function(newRecipe){
    try {
    const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
    .map(ing =>  {
        const ingArray = ing[1].split(',').map(el => el.trim())
        if (ingArray.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format!');
        const [quantity, unit, description] = ingArray;
        return {quantity: quantity ?  +quantity : null,unit,description};
    });
    const recipe = {
        title: newRecipe.title,
        source_url: newRecipe.sourceUrl,
        image_url: newRecipe.image_url,
        publisher: newRecipe.publisher,
        cooking_time: +newRecipe.cooking_time,
        servings: +newRecipe.servings,
        ingredients
        };
    const data = await AJAX(`${API_URL}?key=${API_KEY}`,recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
    }catch(err) {
        throw err;
    }
}