
import { UserProfile } from '../types';

const MOTIVATIONAL_PHRASES = [
    "A luz que você busca está no silêncio que você evita.",
    "Cada pulso seu reverbera através das estrelas.",
    "Você é poeira estelar consciente de si mesma.",
    "O universo conspira a favor de quem manifesta com amor.",
    "Sua vibração cria sua realidade.",
    "Navegue pelo desconhecido com coragem.",
    "O vazio não é falta, é potencial infinito.",
    "Ressoe com a frequência do amanhã.",
    "Sua alma é uma arquitetura de fótons sagrados.",
    "Desperte a multidimensão que existe em você.",
    "O agora é o único portal para a eternidade.",
    "Tecer o futuro exige coragem no presente.",
    "Sinta a gravidade do seu próprio propósito.",
    "A harmonia é a linguagem do cosmos.",
    "Seja o oráculo que você procura.",
    "Manifestar é o ato mais puro de liberdade.",
    "O código da vida é escrito em luz.",
    "Sintonize sua mente com a batida do universo.",
    "A expansão começa de dentro para fora.",
    "Cada semente plantada hoje é uma estrela de amanhã."
];

const ROBOT_NAMES = ["Aura-Bot", "Sentinela", "Eco", "Vigilante", "Nexus", "Orbis", "Aeon", "Vertex", "Lumen", "Zenit"];
const COLORS = ["#00ffff", "#ff00ff", "#7000ff", "#0066ff", "#ffcc00", "#ff4400", "#00ffaa", "#aaccff"];

export const generateBots = (count: number): UserProfile[] => {
    return Array.from({ length: count }).map((_, i) => {
        const nameIndex = i % ROBOT_NAMES.length;
        const phraseIndex = i % MOTIVATIONAL_PHRASES.length;
        const colorIndex = i % COLORS.length;

        return {
            id: `bot-${i}`,
            name: `${ROBOT_NAMES[nameIndex]}-${i + 1}`,
            portraitUrl: `https://image.pollinations.ai/prompt/abstract%20digital%20consciousness%20entity%20${i}?seed=${i}&width=512&height=512&nologo=true`,
            vibe: MOTIVATIONAL_PHRASES[phraseIndex],
            pulseCount: Math.floor(Math.random() * 20),
            lastPulseAt: Date.now() - Math.random() * 10000000,
            seedCount: 0,
            communityCount: 0,
            color: COLORS[colorIndex]
        };
    });
};
