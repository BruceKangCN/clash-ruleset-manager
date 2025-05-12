<script lang="ts">
    import { Heading, P, Span } from "flowbite-svelte";
</script>

<main class="container mx-auto flex flex-col gap-2 p-4">
    <Heading tag="h1" class="border-b p-2">首页</Heading>

    <P>请通过导航栏使用具体功能</P>

    <!-- start: rule management doc -->
    <Heading tag="h2" class="border-b p-2">规则管理</Heading>
    <P>该模块实现了规则集的创建、删除、排序、重命名功能，以及规则集下属规则组的编辑功能。</P>
    <P>
        {[
            "由于排序功能、重命名功能以及依赖排序功能的删除功能较为复杂，",
            "以及为了保证操作逻辑的一致性，",
            "本模块下除了导出以外的所有功能均将操作结果进行缓存，",
            "而不对规则文件进行更新。",
            "待所有操作完成后，请使用导出功能对规则文件进行更新。",
        ].join("")}
    </P>
    <P>本模块的排序功能通过拖拽方式实现。</P>
    <!-- end: rule management doc -->

    <!-- start: node management doc -->
    <Heading tag="h2" class="border-b p-2">节点管理</Heading>

    <P>该模块实现了节点内容的查看、更新。由于功能较为简单，内容更新后数据将直接写入文件。</P>
    <P>节点被分类为<Span class="font-bold">订阅</Span>、<Span class="font-bold">自建</Span>两组。</P>

    <Heading tag="h3" class="p-2">订阅节点</Heading>
    <P>订阅节点按行分割，每一行为一个订阅，格式为 <code>name:url</code>，例如</P>
    <div class="code-block">
        <pre><code>foo:https://foo.example.com/sub.txt</code></pre>
        <pre><code>bar:http://sub.bar.net/api/sub?token=abc123</code></pre>
    </div>

    <Heading tag="h3" class="p-2">自建节点</Heading>
    <P>自建节点按行分割，每一行为一个节点，内容是节点地址，例如：</P>
    <div class="code-block">
        <pre><code>vless://33d361b2-3324-4a26-aa12-1328893c9b6d@foo.example.com:5379?path=%2F&type=tcp&encryption=none&security=tls</code></pre>
    </div>
    <!-- end: node management doc -->
</main>
