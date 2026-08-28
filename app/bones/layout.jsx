import BoneyardProvider from "@/components/boneyard-provider";

export default function BonesLayout({ children }) {
  return (
    <>
      <BoneyardProvider />
      {children}
    </>
  );
}
