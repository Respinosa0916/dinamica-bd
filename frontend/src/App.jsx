import { useState, useEffect } from 'react'

const API_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

function App() {
  const [view, setView] = useState('home'); // 'home', 'instructor', 'player'
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState({}); // { id: true }
  const [currentMission, setCurrentMission] = useState(null);
  const [info, setInfo] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [playersList, setPlayersList] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/info`)
      .then(res => res.json())
      .then(data => setInfo(data))
      .catch(err => console.error("Error fetching info", err));

    fetch(`${API_URL}/missions`)
      .then(res => res.json())
      .then(data => setMissions(data))
      .catch(err => console.error("Error fetching missions", err));
  }, []);

  const fetchPlayers = () => {
    fetch(`${API_URL}/players`)
      .then(res => res.json())
      .then(data => setPlayersList(data))
      .catch(err => console.error(err));
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      try {
        const res = await fetch(`${API_URL}/players`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: playerName })
        });
        const data = await res.json();
        setPlayerId(data.id);
        setView('player');
      } catch (err) {
        console.error("Error al registrar", err);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    try {
      const res = await fetch(`${API_URL}/missions/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: currentMission.id, answer, playerId })
      });
      const data = await res.json();
      
      setFeedback(data);
      if (data.correct) {
        setCompletedMissions(prev => ({ ...prev, [currentMission.id]: true }));
      }
    } catch (err) {
      setFeedback({ correct: false, error: 'Error de conexión con el servidor.' });
    }
  };

  const handleNextMission = () => {
    const currentIndex = missions.findIndex(m => m.id === currentMission.id);
    if (currentIndex >= 0 && currentIndex < missions.length - 1) {
      setCurrentMission(missions[currentIndex + 1]);
      setAnswer('');
      setFeedback(null);
    } else {
      // Si ya no hay más misiones, cerramos
      closeMission();
    }
  };

  const closeMission = () => {
    setCurrentMission(null);
    setAnswer('');
    setFeedback(null);
  };

  if (view === 'instructor') {
    return (
      <div className="container">
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          <h1 className="title">Dashboard del Instructor</h1>
          <p>Los aprendices pueden unirse escaneando el siguiente código QR o usando el enlace público:</p>
          {info ? (
            <div style={{ margin: '2rem 0' }}>
              <img src={info.qrCode} alt="QR Code" style={{ borderRadius: '16px', border: '4px solid var(--accent-color)', maxWidth: '100%', height: 'auto' }} />
              <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>Enlace para conectarse desde cualquier red:</p>
              <h2 style={{ color: '#60a5fa', wordBreak: 'break-all' }}><a href={info.url} target="_blank" rel="noreferrer" style={{color: 'inherit'}}>{info.url}</a></h2>
            </div>
          ) : <p>Cargando información y generando túnel público...</p>}
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '2rem 0' }} />
          
          <h2>Jugadores Conectados</h2>
          <button className="btn-secondary" style={{ padding: '0.5rem 1rem', margin: '1rem 0' }} onClick={fetchPlayers}>Refrescar Lista</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', textAlign: 'left' }}>
            {playersList.map(p => (
              <div key={p.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <h3>{p.name}</h3>
                <p style={{ color: 'var(--success)' }}>Puntos: {p.score}</p>
              </div>
            ))}
            {playersList.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No hay jugadores aún.</p>}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '2rem 0' }} />
          <button className="btn" onClick={() => setView('home')}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  if (view === 'player') {
    if (currentMission) {
      const currentIndex = missions.findIndex(m => m.id === currentMission.id);
      const isLastMission = currentIndex === missions.length - 1;

      return (
        <div className="container">
          <div className="glass-panel">
            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }} onClick={closeMission}>← Volver a Misiones</button>
            <h2 style={{ color: '#60a5fa' }}>{currentMission.title}</h2>
            <p style={{ margin: '1rem 0', fontSize: '1.2rem' }}>{currentMission.description}</p>
            
            {currentMission.type === 'theory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                {currentMission.options.map((opt, idx) => (
                  <button 
                    key={idx} 
                    className="btn-secondary" 
                    style={{ textAlign: 'left', padding: '1rem', background: answer === String(idx) ? 'rgba(59, 130, 246, 0.2)' : 'transparent' }}
                    onClick={() => setAnswer(String(idx))}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {currentMission.type === 'sql' && (
              <div>
                <textarea 
                  placeholder="Escribe tu consulta SQL aquí... Ej: SELECT * FROM videojuegos;"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </div>
            )}

            {!feedback && (
              <button className="btn" style={{ marginTop: '1rem', width: '100%' }} onClick={handleSubmitAnswer}>
                Validar Respuesta
              </button>
            )}

            {feedback && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                borderRadius: '8px', 
                background: feedback.correct ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${feedback.correct ? 'var(--success)' : 'var(--danger)'}` 
              }}>
                <h3 style={{ color: feedback.correct ? 'var(--success)' : 'var(--danger)' }}>
                  {feedback.correct ? '¡Correcto! Excelente trabajo.' : 'Incorrecto.'}
                </h3>
                {feedback.error && <p style={{ marginTop: '0.5rem' }}>{feedback.error}</p>}
                
                {!feedback.correct && feedback.correctAnswer && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', borderLeft: '4px solid var(--accent-color)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>La respuesta esperada era:</p>
                    <code style={{ color: '#60a5fa', wordBreak: 'break-word' }}>{feedback.correctAnswer}</code>
                  </div>
                )}

                {feedback.userResult && !feedback.error && (
                  <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                    <p><strong>Tu resultado:</strong> {JSON.stringify(feedback.userResult).substring(0, 100)}...</p>
                  </div>
                )}
                
                <button 
                  className="btn" 
                  style={{ 
                    marginTop: '1.5rem', 
                    width: '100%', 
                    background: feedback.correct ? 'var(--success)' : 'var(--danger)' 
                  }} 
                  onClick={handleNextMission}
                >
                  {isLastMission ? 'Terminar Misiones' : 'Siguiente Misión →'}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="container">
        <h1 className="title">Hola, {playerName}!</h1>
        <p>Selecciona una misión para comenzar. ¡Demuestra tus conocimientos!</p>
        
        <div className="missions-grid">
          {missions.map(m => (
            <div key={m.id} className="glass-panel mission-card" onClick={() => setCurrentMission(m)}>
              <div>
                <span className={`tag ${m.type}`}>{m.type === 'theory' ? 'Teoría' : 'Reto SQL'}</span>
                <h3>{m.title}</h3>
              </div>
              <div className={`status ${completedMissions[m.id] ? 'completed' : 'pending'}`}>
                {completedMissions[m.id] ? '✅ Completada' : '⏳ Pendiente'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Home View
  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
        <h1 className="title">Dinámica BD</h1>
        <p style={{ marginBottom: '2rem' }}>Aprende Bases de Datos y SQL de forma interactiva.</p>
        
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Ingresa tu nombre..." 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value)}
            required 
          />
          <button type="submit" className="btn">Unirme a la partida</button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '2rem 0' }} />
        
        <button className="btn-secondary btn" onClick={() => setView('instructor')}>
          Soy el Instructor (Ver código QR)
        </button>
      </div>
    </div>
  )
}

export default App
