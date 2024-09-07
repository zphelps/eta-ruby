// import xior from "xior";
import axios from "axios";

import {toast} from "@/components/ui/use-toast";

export const api = axios.create({
    baseURL: "/api",
})

api.interceptors.response.use(
    function (response) {
        return response.data;
    },
    function (error) {

        console.log("API Request Error:")
        console.log(error.response);
        toast({
            title: "Error",
            variant: "destructive",
            description: error.response?.data.message || error.message,
            duration: 3000,
        })

        // if (error.response?.status === 401) {
        //     // User not auth, ask to re signin
        //     // toast.error("Please signin");
        //     // Sends the user to the signin page
        //     // redirect(config.auth.loginUrl);
        // } else if (error.response?.status === 403) {
        //     // User not authorized, must subscribe/purchase/pick a plan
        //     message = "Pick a plan to use this feature";
        // } else {
        //     message =
        //         error?.response?.data?.error || error.message || error.toString();
        // }
        //
        // error.message =
        //     typeof message === "string" ? message : JSON.stringify(message);
        //
        // console.error(error.message);
        //
        // // Automatically display errors to the user
        // // if (error.message) {
        // //     toast.error(error.message);
        // // } else {
        // //     toast.error("something went wrong...");
        // // }
        return Promise.reject({
            message: error.response?.data.message || error.message,
            status: error.response?.status,
        });
    }
);
