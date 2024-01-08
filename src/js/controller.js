import * as model from './model.js';
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { MODEL_CLOSE_SECONDS } from './config.js';
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
const controlRecipes = async function(){
  try {
    debugger;
    const link = window.location.toString().split("/");
    const id = link[3];
    if (!id) return;
    recipeView.renderSpinner();
    // 0.) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // 1.) Update bookmarks view
    bookmarksView.update(model.state.bookmarks);
    // 2.) Load recipe
    await model.loadRecipe(id);
    // 3.) Render recipe
    recipeView.render(model.state.recipe);
    
  } catch(err){
    recipeView.renderError(`💥💥💥💥 ${err}`);
    console.error(err);
  }
}
const controlSearchResults = async function(){
  try {
    resultsView.renderSpinner();
    // Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // Get search query
    const query = searchView.getQuery();
    if (!query) return console.log('NO');
    // Load search results
    await model.loadSearchResults(query);
    // Render results
    resultsView.render(model.getSearchResultsPage());
    // Render initial pagination buttons
    paginationView.render(model.state.search);
    } catch(err){
      recipeView.renderError(err);
    }
}
const controlPagination = function(goToPage){
    // Render NEW results
    resultsView.render(model.getSearchResultsPage(goToPage));
    // Render NEW pagination buttons
    paginationView.render(model.state.search);
}
const controlServings = function(newServings){
    // Update the recipe servings(in state)
    model.updateServings(newServings);
    // Update the recipe view
    recipeView.update(model.state.recipe);
}
const controlAddBookmark = function(){
    // Add or remove bookmark
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else if (model.state.recipe.bookmarked) model.deleteBookmark(model.state.recipe.id );
    // Update recipe view
    recipeView.update(model.state.recipe);
    // Render bookmarks
    bookmarksView.render(model.state.bookmarks);
    
}
const controlBookmarks = function(){
    bookmarksView.render(model.state.bookmarks);
}
const controlAddRecipe = async function(newRecipe){
    try {
      addRecipeView.renderSpinner();
      // Upload the new recipe data
      await model.uploadRecipe(newRecipe);
      // Render recipe
      recipeView.render(model.state.recipe);
      // Success message
      addRecipeView.renderSuccess();
      // Render bookmark view
      bookmarksView.render(model.state.bookmarks);
      // Change ID in URL
      window.history.pushState(null,'',`#${model.state.recipe.id}`);
      // Close form window
      setTimeout(function(){
        addRecipeView.toggleWindow();
      },MODEL_CLOSE_SECONDS * 1000)
    } catch(err){
      console.error('❗️❗️❗️',err);
      addRecipeView.renderError(err.message);
    }
}
const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();