import { FaGithub, FaYoutube, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import CreditCardIcon from './Logo';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white flex justify-between h-28 items-center p-24">
            <div className="flex items-center">
                <div className='flex items-center space-x-2'>
                    <CreditCardIcon className="h-10 w-10 text-[#00baf2]" />
                    <span className="text-3xl font-bold">QuantumPay</span>
                </div>
            </div>
            <div className="flex items-center">
                <span className="mr-4 text-lg">Follow On</span>
                <a href="https://github.com/sid8109" target="_blank" className="text-white ml-4">
                    <FaGithub size={26} />
                </a>
                <a href="https://www.instagram.com/siddharthgogri81/" target="_blank" className="text-white ml-4">
                    <FaInstagram size={26} />
                </a>
                <a href="https://twitter.com/siddharth_gogri" target="_blank" className="text-white ml-4">
                    <FaXTwitter size={26} />
                </a>
            </div>
        </footer>
    );
};

export default Footer;
