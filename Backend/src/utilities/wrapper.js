export const wrapper=(func)=>{
   return async (req,res,next)=>{
    try {
          await func(req,res,next)
    } catch (error) {
       return res.status(error.statusCode||400).json(
            {
                success:false,
                statusCode:error.statusCode,
                message:error.message,
                name:error.name
            }
        )
    }
   }
}
