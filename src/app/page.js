"use client"
import styles from "./page.module.css";
import { useRouter } from 'next/navigation'
export default function Home() {
  const router = useRouter()
  const OnClickFunction = () => {
    router.push(`/room/${Math.random()*10000000000000000}`)
  }

  return (
    <div className={styles.page}>
      <div>
        <h2 onClick={() => OnClickFunction()}>WebSocket Client Connect To Room</h2>
      </div>
    </div>
  );
}
