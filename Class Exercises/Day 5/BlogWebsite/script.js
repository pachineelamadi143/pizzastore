const App=(function()
{
    const POSTS= "https://jsonplaceholder.typicode.com/posts";
    const TODOS= "https://jsonplaceholder.typicode.com/todos";

    const postsContainer=document.getElementById("posts");
    const todosContainer=document.getElementById("todos");
    
    async function fetchData(url) 
    {
        try
        {
            const response=await fetch(url);
            if(!response.ok)
            {
                throw new Error("Server responded with error");
            }
            return await response.json();
        } 
        catch(error)
        {
            throw error;
        }  
    }
    async function loadPosts() 
    {
        try 
        {
            const posts = await fetchData(POSTS);
            posts.slice(0,5).forEach(post =>
                {
                    const div=document.createElement("div");
                    div.className="post";
                    div.innerHTML= `<h4>${post.title}</h4><p>${post.body}</p>`;
                    postsContainer.appendChild(div);
            });
        }
        catch(error)
        {
            postsContainer.innerHTML=`<p class="error">Failed to load post</p>`;
        }
    }
    async function loadTodos()
    {
        try
        {
            const todos=await fetchData(TODOS);
            todos.slice(0,5).forEach(todo =>
            {
                const div =document.createElement("div");
                div.className="todo";
                div.innerHTML=`
                <p> 
                    <input type="checkbox" ${todo.completed ? "checked" : ""} disabled />
                    ${todo.title}
                </p>`
                todosContainer.appendChild(div);
            }
            )
        }
        catch(error)
        {
            todosContainer.innerHTML= `<p class="error">Failed to load todos</p>`;
        }
    }
    return {
        init: function()
        {
            loadPosts();
            loadTodos();
        }
    };

})();

App.init();