import { useEffect, useState, useMemo } from 'react'
import { getAppointmentsByUser } from './api/appointments'
import { useAuth } from './context/AuthContext'

const stats = [
	{ label: 'Citas confirmadas', value: '3K+' },
	{ label: 'Especialistas', value: '12' },
	{ label: 'Satisfacción', value: '4.9/5' }
]

const services = [
	{
		title: 'Osteopatía y masajes Holísticos',
		description: 'Alivia tensiones y mejora tu movilidad.'
	},
	{
		title: 'Par biométrico y equilibrado',
		description: 'Equilibra la energía de tu cuerpo de manera natural.'
	},
	{
		title: 'Ténicas emocionales adaptadas',
		description: 'Libera bloqueos emocionales con métodos especializados.'
	}
]

export default function Home() {
	const [gradientPhase, setGradientPhase] = useState(0)
	const [agendaLoading, setAgendaLoading] = useState(false)
	const [agendaError, setAgendaError] = useState(null)
	const [agendaItems, setAgendaItems] = useState([])
	const { user } = useAuth()

	useEffect(() => {
		const interval = setInterval(() => {
			setGradientPhase((prev) => (prev + 1.2) % 360)
		}, 60)
		return () => clearInterval(interval)
	}, [])

	const headlineStyle = useMemo(() => {
		const radians = (gradientPhase * Math.PI) / 180
		const offset = Math.sin(radians) * 8 // keep hues tight around green family
		const hue1 = 115 + offset
		const hue2 = 125 + offset / 2
		const hue3 = 135 + offset

		return {
			backgroundImage: `linear-gradient(120deg,
				hsl(${hue1}, 70%, 32%),
				hsl(${hue2}, 75%, 42%),
				hsl(${hue3}, 70%, 58%)
			)`,
			backgroundSize: '200% 200%'
		}
	}, [gradientPhase])

	useEffect(() => {
		if (!user) {
			setAgendaItems([])
			return
		}

		let active = true
		const fetchAgenda = async () => {
			try {
				setAgendaLoading(true)
				setAgendaError(null)
				const data = await getAppointmentsByUser(user.id)

				if (!active) return

				const upcoming = (data || [])
					.filter((appt) => new Date(appt.start_at) >= new Date())
					.sort((a, b) => new Date(a.start_at) - new Date(b.start_at))
					.slice(0, 3)

				setAgendaItems(upcoming)
			} catch (error) {
				if (!active) return
				setAgendaError('No se pudo cargar tu agenda. Inténtalo más tarde.')
			} finally {
				if (active) setAgendaLoading(false)
			}
		}

		fetchAgenda()
		return () => {
			active = false
		}
	}, [user])

	const formatSlot = (startAt) => {
		const date = new Date(startAt)
		return `${date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}`
	}

	const formatHour = (startAt) => {
		return new Date(startAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
	}

	return (
		<div className="space-y-10">
			<section className="grid gap-10 rounded-[32px] border border-white/60 bg-gradient-to-br from-white via-emerald-50 to-white p-8 shadow-2xl shadow-emerald-100 lg:grid-cols-2">
				<div className="space-y-6">
					<p className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
						Bienestar natural
					</p>
					<div>
						<div className="relative inline-block">
							<span
								aria-hidden="true"
								className="absolute -left-8 top-1/2 hidden h-14 w-14 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-200 to-lime-200 opacity-60 blur-2xl sm:block"
							/>
							<h1
								className="relative bg-clip-text text-transparent leading-tight drop-shadow-sm"
								style={headlineStyle}
							>
								El bienestar es una decisión y empieza hoy
							</h1>
						</div>
						<p className="mt-4 text-lg text-gray-600">
							Tu bienestar es una decisión que puedes tomar hoy. Con más de 25 años de experiencia, te ayudo a alcanzar un equilibrio entre cuerpo, mente y alimentación.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<a
							href="/citas"
							className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-emerald-300"
						>
							<span>Reservar cita</span>
							<span aria-hidden="true">→</span>
						</a>
						<a
							href="/store"
							className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-6 py-3 text-base font-semibold text-emerald-700 shadow-md shadow-emerald-50 transition hover:-translate-y-0.5 hover:border-emerald-300"
						>
							<span className="h-2 w-2 rounded-full bg-emerald-400" />
							<span>Explorar tienda</span>
						</a>
					</div>
					<dl className="grid gap-6 sm:grid-cols-3">
						{stats.map((stat) => (
							<div key={stat.label} className="rounded-2xl border border-white/70 bg-white/80 p-4 text-center shadow-lg shadow-emerald-100">
								<dt className="text-xs font-semibold uppercase tracking-widest text-gray-500">{stat.label}</dt>
								<dd className="mt-2 text-3xl font-semibold text-emerald-600">{stat.value}</dd>
							</div>
						))}
					</dl>
				</div>

				<div className="relative">
					<div className="absolute inset-0 -z-10 scale-105 rounded-[36px] bg-gradient-to-br from-emerald-200/60 to-green-100/60 blur-3xl" />
					<div className="rounded-[32px] border border-white bg-white/90 p-6 shadow-2xl shadow-emerald-100 backdrop-blur">
						<div className="rounded-2xl bg-emerald-50/70 p-6">
							<p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700"></p>
							<h3 className="mt-4 text-3xl font-semibold text-gray-900">Agenda</h3>
							<p className="mt-2 text-gray-600"> Tus citas previstas</p>

							<div className="mt-6 space-y-4">
								{agendaLoading && (
									<div className="rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 text-sm text-emerald-700">
										Cargando tus próximas citas...
									</div>
								)}

								{agendaError && (
									<div className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-600">
										{agendaError}
									</div>
								)}

								{!user && !agendaLoading && (
									<div className="rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 text-sm text-gray-600">
										Inicia sesión para ver tu agenda personalizada.
									</div>
								)}

								{user && !agendaLoading && agendaItems.length === 0 && !agendaError && (
									<div className="rounded-2xl border border-dashed border-emerald-200 px-4 py-3 text-sm text-emerald-700">
										Aún no tienes citas próximas. Reserva tu próximo momento de bienestar.
									</div>
								)}

								{agendaItems.map((appointment) => (
									<article
										key={appointment.id}
										className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-md shadow-emerald-100"
									>
										<div>
											<p className="text-xs uppercase tracking-widest text-gray-400">
												{formatSlot(appointment.start_at)} · {formatHour(appointment.start_at)}
											</p>
											<p className="text-lg font-semibold text-gray-900">
												{appointment.appointment_type?.name || 'Cita personalizada'}
											</p>
											<p className="text-sm text-gray-500 capitalize">Estado: {appointment.status}</p>
										</div>
										<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
											Confirmada
										</span>
									</article>
								))}

								{user && agendaItems.length > 0 && (
									<a href="/citas" className="inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-900">
										Ver todas mis citas →
									</a>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-xl shadow-emerald-100 backdrop-blur">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">Contacto</p>
						<h2 className="text-3xl text-gray-900">Estamos en Alcalá de Guadaira · Sevilla</h2>
						<p className="mt-1 text-gray-500">Avenida Santa Lucía · 41500 Alcalá de Guadaira</p>
					</div>
					<a
						href="tel:+34600000000"
						className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-emerald-300"
					>
						<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">📞</span>
						<span>Llamar ahora</span>
					</a>
				</div>

				<div className="mt-8 grid gap-6 md:grid-cols-3">
					<article className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg shadow-emerald-100">
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Horario</p>
						<p className="mt-3 text-lg font-semibold text-gray-900">Lunes a Jueves</p>
						<p className="text-gray-600">10:00 - 21:00</p>
						<p className="mt-4 text-lg font-semibold text-gray-900">Viernes</p>
						<p className="text-gray-600">10:00 - 13:00</p>
					</article>

					<article className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg shadow-emerald-100">
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Contacto</p>
						<p className="mt-3 text-lg font-semibold text-gray-900">info@natursur.com</p>
						<p className="text-gray-600">+34 691 355 682</p>
						<p className="mt-4 text-sm text-gray-500">WhatsApp disponible</p>
					</article>

					<article className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg shadow-emerald-100">
						<p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Tiempo de respuesta</p>
						<p className="mt-3 text-3xl font-semibold text-emerald-600">&lt; 15 min</p>
						<p className="text-gray-600">Equipo atento y cercano</p>
					</article>
				</div>
			</section>

			<section className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-xl shadow-emerald-100 backdrop-blur">
				<p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">Especialidades</p>
				<h2 className="mt-2 text-3xl text-gray-900">Servicios Natursur</h2>
				<div className="mt-8 grid gap-4 md:grid-cols-3">
					{services.map((service) => (
						<article key={service.title} className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-6 shadow-lg shadow-emerald-100">
							<h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
							<p className="mt-2 text-gray-600">{service.description}</p>
						</article>
					))}
				</div>
			</section>
		</div>
	)
}
