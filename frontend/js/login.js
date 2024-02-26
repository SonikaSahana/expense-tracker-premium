
const axiosInstance = axios.create({
    baseURL : "http://localhost:4000/user"
    // withCredentials : true
    // httpsAgent: new https.Agent({  
        //     rejectUnauthorized: false
        // })
    })
    document.getElementById('login').addEventListener('submit' , loginUser)


async function loginUser(e){
    e.preventDefault()
    
    const data = {
        email : e.target.email.value,
        password : e.target.password.value
    }
    console.log(data)

    try{
        const result = await axiosInstance.post('/login' , data)
        console.log(result)
        if(result.data.success){
            alert("login succesfully")
            localStorage.setItem('token' , result.data.token)
            localStorage.setItem('isPremiumUser' , result.data.isPremiumUser)
            window.location ="/"
        }
    }catch(e){
        console.log(e)
        alert(e.response.data.msg)
    }

}