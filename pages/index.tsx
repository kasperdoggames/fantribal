import Head from "next/head";
import Router from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { NextPage } from "next";
import { useRef } from "react";

const Home: NextPage = () => {
  const bandsRef = useRef<HTMLDivElement>(null);
  const venuesRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-[url('/background.png')] bg-center h-full">
      <div className="container h-full max-w-7xl mx-auto">
        <Head>
          <title>FanTribal</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Header currentPageHref="/" />
        <div className="relative overflow-hidden">
          <img
            className="absolute inset-0 object-cover w-full h-full opacity-25"
            src="/fans.png"
          ></img>
          <div className="relative px-8 pt-4 pb-8 text-white">
            <h1 className="text-center font-extrabold text-4xl pb-8 font-[Kanit]">
              FANTRIBAL
            </h1>
            <div className="space-y-2">
              <p className="leading-7">
                Fantribal is a place for music artists, bands and their fans to
                create a powerful connections with their fanbase. A place to
                create and sell NFTs that celebrate events in the lifetime of
                fledgling artists.
              </p>
              <p>
                Timelines of collectible NFTs provide valuable funds to support
                new artists. Venues benefit from the early support and
                confidence they provide.
              </p>
            </div>
            <div className="flex flex-col justify-around py-4 space-y-4 sm:flex-row sm:space-y-0">
              <button
                className="px-4 py-2 font-bold rounded-full bg-violet-500"
                onClick={() => {
                  if (bandsRef && bandsRef.current) {
                    bandsRef.current.scrollIntoView();
                  }
                }}
              >
                BANDS
              </button>
              <button
                className="px-4 py-2 font-bold rounded-full bg-violet-500"
                onClick={() => {
                  if (venuesRef && venuesRef.current) {
                    venuesRef.current.scrollIntoView();
                  }
                }}
              >
                VENUES
              </button>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <img
            className="absolute inset-0 object-cover w-full h-full opacity-25"
            src="/band_playing.png"
          ></img>
          <div className="relative p-8 text-white" ref={bandsRef}>
            <h2 className="text-center font-bold text-2xl pb-8 font-[Kanit]">
              BANDS / ARTISTS
            </h2>
            <p className="leading-7">
              “A true fan is someone who will purchase anything and everything
              you produce. They will drive 200 miles to see you sing. They will
              buy the superdeluxe reissued hi-res box set of your stuff even
              though they have the low-res version. They have a Google Alert set
              for your name. They bookmark the eBay page where your out-of-print
              editions show up. They come to your openings. They have you sign
              their copies. They buy the T-shirt, and the mug, and the hat. They
              are true fans.”
            </p>
            <p className="pt-1 pb-2 text-sm font-semibold opacity-30">
              KEVIN KELLY - 1000 TRUE FANS THEORY
            </p>
            <div className="flex flex-col justify-around py-4 space-y-4 sm:flex-row sm:space-y-0">
              <div className="flex flex-col items-center justify-between w-full p-4 space-y-4 text-center rounded-2xl bg-purple-300/25 sm:w-52">
                <p className="font-semibold">
                  Are you a band who want's to make a unique connection with
                  your fans?
                </p>
                <button
                  className="w-full px-4 py-2 text-sm font-bold rounded-full bg-violet-500 sm:w-auto"
                  onClick={() => Router.push("/createProfile")}
                >
                  CREATE PROFILE
                </button>
              </div>
              <div className="flex flex-col items-center justify-between w-full p-4 space-y-4 text-center rounded-2xl bg-purple-300/25 sm:w-52">
                <p className="font-semibold">
                  Are you a fan wanting to connect with your favourite band?
                </p>
                <button
                  className="w-full px-4 py-2 text-sm font-bold rounded-full bg-violet-500 sm:w-auto"
                  onClick={() => Router.push("/bands")}
                >
                  BAND SEARCH
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <img
            className="absolute inset-0 object-cover w-full h-full opacity-50"
            src="/venue.png"
          ></img>
          <div className="relative p-8 text-white" ref={venuesRef}>
            <h2 className="text-center font-bold text-2xl pb-8 font-[Kanit]">
              VENUES
            </h2>
            <p className="font-[Montserrat] leading-7">
              “Despite only having been in the band a few days, Will organised
              our first gig in the Laurel Tree. Unfortunately, we had no name
              and in a panic chose Starfish. The gig went ok, although we played
              one song twice - not a good idea. “
            </p>
            <p className="pt-1 pb-2 text-sm font-semibold opacity-30">
              COLDPLAY 1998
            </p>
            <div className="flex flex-col justify-around py-4 space-y-4 sm:flex-row sm:space-y-0">
              <div className="flex flex-col items-center justify-between w-full p-4 space-y-4 text-center rounded-2xl bg-purple-300/25 sm:w-52">
                <p className="font-semibold">
                  Are you a venue wanting to connect with local bands and their
                  fans?
                </p>
                <button className="w-full px-4 py-2 font-bold rounded-full bg-violet-500 sm:w-auto">
                  SETUP VENUE
                </button>
              </div>
              <div className="flex flex-col items-center justify-between w-full p-4 space-y-4 text-center rounded-2xl bg-purple-300/25 sm:w-52">
                <p className="font-semibold">
                  Are you a fan wanted to checkout local bands and venues?
                </p>
                <button className="w-full px-4 py-2 font-bold rounded-full bg-violet-500 sm:w-auto">
                  VENUE SEARCH
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
