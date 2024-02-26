var resetId = null;

const axiosInstance = axios.create({
    baseURL : 'http://localhost:4000/password'
    
})

window.addEventListener('load' , async()=>{
    let url = window.location.href
    let arr = url.split("?reset=")
    resetId = arr[1]
    console.log(resetId)
    if(resetId == null || resetId.length == 0){
        alert("wrong link")
        location.href ='forgot-password.html'
    }
    const res = await axiosInstance.get(`/check-password-link/${resetId}`)
    if(!res.data.isActive){
        alert("link expired get a new one")
        location.href ='forgot-password.html'
    }
    console.log(res)

})


const form = document.forms[0]
form.addEventListener('submit' , handleSubmit)

async function handleSubmit(e){
    try{

        e.preventDefault()
        const newPassword = e.target['new-password'].value
        const confirmPassword = e.target['confirm-password'].value
        console.log(newPassword)
        
        if(newPassword !== confirmPassword)
        alert('new and confirm password are different')
    else{
        const res = await axiosInstance.post(`/reset-password/${resetId}`,{newPassword , confirmPassword})
        console.log(res)
        if(res.data.success){
            alert('password changed successfully now you can login again')
            window.location.href = 'login.html'
        }
    }
}catch(e){
    console.log(e)
}
    
}