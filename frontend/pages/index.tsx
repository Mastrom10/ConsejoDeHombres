import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import PeticionCard, { PeticionDto } from '../components/PeticionCard';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [peticiones, setPeticiones] = useState<PeticionDto[]>([]);

  useEffect(() => {
    axios.get(`${API}/peticiones`).then((res) => setPeticiones(res.data));
  }, []);

  return (
    <>
      <Header />
      <div className="container">
        <h1>Últimas peticiones</h1>
        <div className="grid">
          {peticiones.map((p) => (
            <PeticionCard peticion={p} key={p.id} />
          ))}
        </div>
      </div>
    </>
  );
}
