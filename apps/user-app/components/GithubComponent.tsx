export default function GithubComponent() {
    return (
        <div className="min-h-full flex items-center justify-center mx-4 pb-12 mb-10">
                <div className="bg-[#c1bcbc] rounded-lg p-8 shadow-lg flex flex-col md:flex-row items-center max-w-4xl w-full">
                    <div className="flex-1 flex justify-center">
                        <img
                            src="https://res.cloudinary.com/dcugqfvvg/image/upload/v1713657312/undraw_questions_re_1fy7_kqjpu3.svg" 
                            alt="Illustration"
                            width={500}
                            height={500}
                            className="rounded-md"
                        />
                    </div>
                    <div className="flex-1 text-center md:text-left mt-8 md:mt-0 md:ml-8 text-black">
                        <h1 className="text-5xl font-bold">Found an Issue!</h1>
                        <p className="text-gray-800 mt-4">
                            Please create an issue on our GitHub website below. You are also invited to contribute to the project.
                        </p>
                        <a
                            href="https://github.com/sid8109/paytm"
                            target="_blank"
                            className="flex w-full items-center mt-6 justify-center px-4 py-5 bg-gray-400 text-black rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="45"
                                height="45"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2"
                            >
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-6 0C6.27.64 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.5c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 0 0-.94 2.61V22"></path>
                            </svg>
                            <div className="text-4xl">
                                GitHub
                            </div>
                        </a>
                    </div>
                </div>
            </div>
    )
}