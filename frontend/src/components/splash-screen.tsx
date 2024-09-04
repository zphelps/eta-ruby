import {BounceLoader} from "react-spinners";

export const SplashScreen = () => {
    return (
        <div className={'w-screen h-screen flex items-center justify-center'}>
            <BounceLoader color={'#0084C7'} size={60}/>
        </div>
    );
}