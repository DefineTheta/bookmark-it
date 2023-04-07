import api from '@theta-cubed/next-rest/client';

const getLinks = async () => {
	const response = await api.get('/api/links', {
		headers: {},
		params: {},
		body: undefined,
	});

	return response.body.links;
};

export default async function RootPage() {
	const links = await getLinks();

	return (
		<div className="flex flex-col gap-y-4">
			{links.map((link, index) => (
				<a
					className="flex flex-row gap-x-3 w-192 bg-white/5 rounded p-4 hover:bg-white/20 transition-colors duration-100 ease-in-out"
					href={link.link}
				>
					<img src={link.image} className="w-64" />
					<div className="flex flex-col gap-y-1">
						<h2 className="font-bold">{link.title}</h2>
						<p>{link.description}</p>
					</div>
				</a>
			))}
		</div>
	);
}
