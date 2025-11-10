export default function Home(){
  return (
    <main style={{ maxWidth: 1000, margin: '2.5rem auto', padding: '0 1rem' }}>
      <section className="hero" style={{ display:'flex', gap:24, alignItems:'center', background:'linear-gradient(90deg,#fff,#fbfbff)', padding:24, borderRadius:12, boxShadow:'0 6px 18px rgba(16,24,40,0.06)'}}>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontSize: '2rem' }}>Natursur</h1>
          <p style={{ marginTop:8, color:'#374151' }}>Centro de masajes: terapéuticos, relajantes y bienestar. Reserva fácilmente tus citas con nuestros profesionales.</p>

          <div style={{ marginTop:16, display:'flex', gap:8 }}>
            <a href="/citas" className="btn">Reservar cita</a>
            <a href="/store" className="btn ghost">Visitar tienda</a>
          </div>
        </div>

        <div style={{ width:220, textAlign:'center' }}>
          <div style={{ width:160, height:160, borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#06b6d4)', display:'inline-block' }} />
        </div>
      </section>

      <section style={{ marginTop:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'#fff', padding:16, borderRadius:12 }}>
          <h3>Horario</h3>
          <p style={{ margin:4 }}>Lun - Vie: 09:00 - 19:00</p>
          <p style={{ margin:4 }}>Sáb: 10:00 - 14:00</p>
        </div>
        <div style={{ background:'#fff', padding:16, borderRadius:12 }}>
          <h3>Contacto & Dirección</h3>
          <p style={{ margin:4 }}>C/ Ejemplo 123, Ciudad — 28000</p>
          <p style={{ margin:4 }}>Tel: +34 600 000 000</p>
        </div>
      </section>
    </main>
  )
}
