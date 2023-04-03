import api from "@theta-cubed/next-rest/client"

const getLinks = async () => {
  const response = await api.get("/api/links", { headers: {}, params: {}, body: undefined });

  return response.body.links;
}

export default async function RootPage() {
  const links = await getLinks();

  return (
    <div className="flex flex-col gap-y-2">{
      links.map((link, index) => (
        <span className="text-sm">{link.title}</span>
      ))
    }</div>
  );
}
