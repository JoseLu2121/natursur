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
	return (
		<div className="space-y-10">
			<section className="grid gap-10 rounded-[32px] border border-white/60 bg-gradient-to-br from-white via-emerald-50 to-white p-8 shadow-2xl shadow-emerald-100 lg:grid-cols-2">
				<div className="space-y-6">
					<p className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
						Bienestar natural
					</p>
					<div>
						<h1 className="leading-tight text-gray-900">
							El bienestar es una decisión y empieza hoy
						</h1>
						<p className="mt-4 text-lg text-gray-600">
							Tu bienestar es una decisión que puedes tomar hoy. Con más de 25 años de experiencia, te ayudo a alcanzar un equilibrio entre cuerpo, mente y alimentación.
						</p>
					</div>
					<div className="flex flex-wrap gap-3">
						<a href="/citas" className="btn-primary">
							Reservar cita
						</a>
						<a href="/store" className="btn-secondary">
							Explorar tienda
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
							<p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-700">Hoy</p>
							<h3 className="mt-4 text-3xl font-semibold text-gray-900">Agenda</h3>
							<p className="mt-2 text-gray-600"> Tus citas previstas</p>

							<div className="mt-6 space-y-4">
								<article className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-md shadow-emerald-100">
									<div>
										<p className="text-xs uppercase tracking-widest text-gray-400">09:30</p>
										<p className="text-lg font-semibold text-gray-900">Escapada sensorial</p>
										<p className="text-sm text-gray-500">con Marina Torres</p>
									</div>
									<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
										Confirmada
									</span>
								</article>

								<article className="flex items-center justify-between rounded-2xl border border-dashed border-emerald-200 px-4 py-3">
									<div>
										<p className="text-xs uppercase tracking-widest text-gray-400">11:00</p>
										<p className="text-lg font-semibold text-gray-900">Masaje relajante</p>
										<p className="text-sm text-gray-500">disponible esta semana</p>
									</div>
									<span className="text-sm font-semibold text-emerald-600">Disponible</span>
								</article>
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
					<a href="tel:+34600000000" className="btn-primary">
						Llamar ahora
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
