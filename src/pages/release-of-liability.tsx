import Head from "next/head";
import ReleaseOfLiabilityComponent from "@/components/release-of-liability";

function ReleaseOfLiabilityPage() {
  return (
    <>
      <Head>
        <title>Waiver and Release of Liability | Ruh-Roh Retreat</title>
        <meta
          name="description"
          content="Review our Waiver and Release of Liability agreement."
        />
      </Head>
      <ReleaseOfLiabilityComponent />
    </>
  );
}

export default ReleaseOfLiabilityPage;
